# <<< Start of final updated script >>>
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torch.optim.lr_scheduler import LambdaLR
import torch.nn.functional as F
import torch.nn.init as init
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import time
import math
import copy
import os
try:
    from torch_ema import ExponentialMovingAverage
    _ema_available = True
except ImportError:
    print("Warning: torch-ema library not found. EMA will be disabled. Install with: pip install torch-ema")
    _ema_available = False
    ExponentialMovingAverage = None # Placeholder

try:
    from torchvision.ops import StochasticDepth
    _stochastic_depth_available = True
except ImportError:
    print("Warning: torchvision.ops.StochasticDepth not found. Stochastic Depth will be disabled. Install or update torchvision.")
    _stochastic_depth_available = False
    StochasticDepth = None # Placeholder

# --- Configuration ---
# !!! IMPORTANT: SET THIS PATH !!!
LANDMARK_CSV_PATH = "JoyVerseDataSet_Filled.csv" # Assumes Procrustes landmarks
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.2
RANDOM_STATE = 42
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {DEVICE}")

# Data Parameters
NUM_LANDMARKS = 478
LANDMARK_DIM = 3

# Model Architecture Configuration
# Adjust based on dataset size (~30k or ~120k)
# For ~120k, consider increasing D_MODEL, NUM_ENCODER_LAYERS, NHEAD, DIM_FEEDFORWARD
D_MODEL = 256
NHEAD = 6
NUM_ENCODER_LAYERS = 4
DIM_FEEDFORWARD = 1024 # 4 * D_MODEL
DROPOUT_RATE = 0.1     # General dropout
LANDMARK_DROPOUT_P = 0.05 # Dropout for entire landmarks
# Use Stochastic Depth only if torchvision is available
STOCHASTIC_DEPTH_PROB = 0.1 if _stochastic_depth_available else 0.0
USE_COORD_SINUSOIDAL_PE = True # Optional: Add sinusoidal PE based on coords
USE_MLP_HEAD = True       # Optional: Use a 2-layer MLP for classification head

NUM_CLASSES = None     # Determined from data

# Training Hyperparameters
LEARNING_RATE = 1e-4 # Peak learning rate after warmup
WEIGHT_DECAY = 0.01
EPOCHS = 200
BATCH_SIZE = 128
WARMUP_EPOCHS = 5
PATIENCE = 15          # Early Stopping patience
LABEL_SMOOTHING = 0.1
# Use EMA only if library is available
USE_EMA = _ema_available
EMA_DECAY = 0.999
NUM_WORKERS = min(os.cpu_count(), 8) if os.cpu_count() and os.cpu_count() > 1 else 0

# --- Helper Functions ---
# (calculate_distance not needed for training script, but keep if useful elsewhere)

# --- Sinusoidal Positional Encoding for Coordinates (Optional) ---

class FlexibleCoordSinusoidalEncoding(nn.Module):
    """
    Generates sinusoidal positional encoding based on 3D coordinates,
    handling any d_model >= 2 using greedy even allocation and a final projection.
    Keeps axis information separate before concatenation & projection.

    Args:
        d_model (int): The target embedding dimension (must be >= 2).
        max_val (float): Estimated max absolute coordinate value AFTER scaling.
                         Used to normalize angles to sin/cos. Default 1.0 assumes
                         input coords are already roughly in [-1, 1].
        clamp_input (bool): Whether to clamp scaled angles to [-pi, pi].
    """
    def _init_(self, d_model: int, max_val: float = 1.0, clamp_input: bool = True):
        super()._init_()

        if isinstance(d_model, torch.Tensor):
            d_model = int(d_model.item())  # Extract scalar safely
            self.d_model = d_model

        if d_model < 2:
            raise ValueError(f"d_model must be >= 2 for sinusoidal pairs, got {d_model}")

        self.d_model = d_model
        self.max_val = max_val
        self.clamp_input = clamp_input

        # 1. Greedy Allocation of Even Dimensions per axis
        self.dims_per_axis_pe = [0, 0, 0] # Store the even dimension used for PE calc
        remaining_dims = d_model
        for i in range(3):
            # Try to allocate the largest possible even number <= remaining_dims
            # But don't necessarily take all remaining if large, distribute somewhat
            # Let's refine the greedy logic slightly to be more balanced:
            # Target rough share = remaining_dims / (3 - i)
            # Target even share = floor(target_share / 2) * 2
            target_share = remaining_dims / (3.0 - i)
            alloc = math.floor(target_share / 2.0) * 2
            # Ensure we don't take more than available
            alloc = min(remaining_dims, alloc)
            # Ensure alloc is even
            alloc = (alloc // 2) * 2

            # Fallback if target_share was < 2 but dims remain
            if alloc == 0 and remaining_dims >= 2:
                 alloc = 2

            self.dims_per_axis_pe[i] = alloc
            remaining_dims -= alloc

        # If dims remain after allocation (due to rounding down), add them back where possible
        # Add remaining dims back as pairs of 2 if possible
        i = 0
        while remaining_dims >= 2:
             self.dims_per_axis_pe[i % 3] += 2
             remaining_dims -= 2
             i += 1

        self.current_dim_total = sum(self.dims_per_axis_pe)
        if self.current_dim_total == 0 and d_model >= 2:
             # Fallback for very small d_model like 2 or 3 where initial logic might fail
             self.dims_per_axis_pe[0] = 2 # Assign first 2 dims to x
             self.current_dim_total = 2



        # 2. Final Projection Layer (replaces padding/truncation)
        if self.current_dim_total != self.d_model:
            # Only add projection if needed
            self.projection = nn.Linear(self.current_dim_total, self.d_model)
            print(f"FlexibleSinPE: Added projection layer from {self.current_dim_total} to {self.d_model}")
            self._init_projection() # Initialize projection layer
        else:
            self.projection = None # No projection needed if dimensions match


    def _init_projection(self):
         if self.projection:
             init.xavier_uniform_(self.projection.weight)
             if self.projection.bias is not None:
                 init.constant_(self.projection.bias, 0)

    def forward(self, coords: torch.Tensor):
        """
        Args:
            coords (torch.Tensor): Coordinates (Batch, SeqLen, 3)
        Returns:
            torch.Tensor: Positional Encoding (Batch, SeqLen, d_model)
        """
        if self.current_dim_total == 0: # Handle cases like d_model=1 or error state
             return torch.zeros(coords.size(0), coords.size(1), self.d_model, device=coords.device)

        B, N, _ = coords.shape
        device = coords.device
        pe_list = []

        # Calculate PE for each axis based on allocated even dimensions
        for axis_idx in range(3):
            d_axis_pe = self.dims_per_axis_pe[axis_idx]
            if d_axis_pe == 0: continue

            num_freq_bands = d_axis_pe // 2
            # Use d_axis_pe for frequency calculation consistency
            div_term = torch.exp(torch.arange(0, d_axis_pe, 2, device=device).float() * (-math.log(10000.0) / d_axis_pe))

            axis_coords = coords[..., axis_idx:axis_idx+1]
            scaled_angles_base = (axis_coords / self.max_val) * math.pi
            if self.clamp_input:
                scaled_angles_base = torch.clamp(scaled_angles_base, -math.pi, math.pi)

            angles = scaled_angles_base * div_term
            pe_axis_sin = torch.sin(angles)
            pe_axis_cos = torch.cos(angles)
            pe_axis = torch.stack((pe_axis_sin, pe_axis_cos), dim=-1).view(B, N, d_axis_pe)
            pe_list.append(pe_axis)

        # Concatenate axis PEs
        concatenated_pe = torch.cat(pe_list, dim=-1) # Shape (B, N, current_dim_total)

        # Apply projection if needed
        if self.projection:
            output_pe = self.projection(concatenated_pe)
        else:
            output_pe = concatenated_pe # Dimensions already match d_model

        return output_pe

# --- Custom Dataset ---
class LandmarkDataset(Dataset):
    # (Dataset class remains the same)
    def _init_(self, features, labels):
        self.features = torch.tensor(features, dtype=torch.float32)
        self.labels = torch.tensor(labels, dtype=torch.long)

    def _len_(self):
        return len(self.labels)

    def _getitem_(self, idx):
        return self.features[idx], self.labels[idx]

# --- Transformer Model (MODIFIED) ---
class LandmarkTransformerClassifier(nn.Module):
    def _init_(self, num_landmarks, landmark_dim, d_model, nhead, num_encoder_layers, dim_feedforward, num_classes,
                 dropout=0.1, landmark_dropout_p=0.0, stochastic_depth_prob=0.0,
                 use_coord_pe=False, use_mlp_head=False):
        super()._init_()
        self.d_model = d_model
        self.num_landmarks = num_landmarks
        self.landmark_dropout_p = landmark_dropout_p
        self.num_encoder_layers = num_encoder_layers
        self.use_coord_pe = use_coord_pe

        # * MODIFICATION: MLP Tower for Feature Embedding *
        self.feature_embedder = nn.Sequential(
            nn.Linear(landmark_dim, d_model * 2),
            nn.GELU(),
            nn.Linear(d_model * 2, d_model)
        )

        # Positional/Index Embedding (Learnable)
        self.positional_embedding = nn.Embedding(num_landmarks + 1, d_model) # +1 for CLS
        self.cls_token = nn.Parameter(torch.randn(1, 1, d_model))

        # Transformer Encoder Layers with GELU and Stochastic Depth wrapper
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, dim_feedforward=dim_feedforward,
                                                   dropout=dropout, activation='gelu', batch_first=True)
        self.encoder_layers = nn.ModuleList()
        for i in range(num_encoder_layers):
            # Calculate drop prob for this layer (linear decay)
            layer_sd_prob = stochastic_depth_prob * float(i) / max(1.0, num_encoder_layers - 1)
            if _stochastic_depth_available and layer_sd_prob > 0:
                # Wrap layer in StochasticDepth if prob > 0 and library available
                 # Use "row" mode to drop entire layer output connection in residual path
                sd_layer = StochasticDepth(p=layer_sd_prob, mode="row")
                self.encoder_layers.append(nn.Sequential(copy.deepcopy(encoder_layer), sd_layer))
            else:
                # Otherwise just add the layer
                self.encoder_layers.append(copy.deepcopy(encoder_layer))

        self.encoder_norm = nn.LayerNorm(d_model) # Final norm after encoder stack

        # Classification Head
        self.dropout_final = nn.Dropout(dropout)
        if use_mlp_head:
             # * NEW: Optional MLP Head *
             self.fc_out = nn.Sequential(
                 nn.Linear(d_model, d_model // 2),
                 nn.GELU(),
                 nn.Dropout(dropout), # Add dropout within MLP head too
                 nn.Linear(d_model // 2, num_classes)
             )
        else:
             # Original single linear layer head
             self.fc_out = nn.Linear(d_model, num_classes)

        self.init_weights() # Call modified init_weights

    # * MODIFICATION: Use Xavier/Normal Initialization (incl. MHA) *
    def init_weights(self):
        # Feature embedder MLP
        for layer in self.feature_embedder:
            if isinstance(layer, nn.Linear):
                init.xavier_uniform_(layer.weight)
                if layer.bias is not None: init.constant_(layer.bias, 0)

        # Positional embeddings and CLS token
        init.normal_(self.positional_embedding.weight, mean=0.0, std=0.02)
        init.normal_(self.cls_token, mean=0.0, std=0.02)

        # Transformer Encoder Layers
        for seq_layer in self.encoder_layers:
             # Access the actual TransformerEncoderLayer
             # It might be directly in ModuleList or inside nn.Sequential(sd, layer)
             actual_layer = seq_layer
             if isinstance(seq_layer, nn.Sequential):
                 actual_layer = seq_layer[-1] # Assumes layer is last in Sequential

             if isinstance(actual_layer, nn.TransformerEncoderLayer):
                 # Initialize FeedForward Linear Layers
                 init.xavier_uniform_(actual_layer.linear1.weight)
                 if actual_layer.linear1.bias is not None: init.constant_(actual_layer.linear1.bias, 0)
                 init.xavier_uniform_(actual_layer.linear2.weight)
                 if actual_layer.linear2.bias is not None: init.constant_(actual_layer.linear2.bias, 0)

                 # Initialize MultiHeadAttention Projections
                 # Note: MHA weights might be combined (in_proj_weight) or separate (q_proj, k_proj, v_proj)
                 # Checking for combined weight first (standard)
                 if hasattr(actual_layer.self_attn, 'in_proj_weight'):
                      init.xavier_uniform_(actual_layer.self_attn.in_proj_weight)
                 else:
                     # Initialize separate Q, K, V projections if they exist
                     if hasattr(actual_layer.self_attn, 'q_proj_weight'):
                          init.xavier_uniform_(actual_layer.self_attn.q_proj_weight)
                     if hasattr(actual_layer.self_attn, 'k_proj_weight'):
                          init.xavier_uniform_(actual_layer.self_attn.k_proj_weight)
                     if hasattr(actual_layer.self_attn, 'v_proj_weight'):
                          init.xavier_uniform_(actual_layer.self_attn.v_proj_weight)

                 if hasattr(actual_layer.self_attn, 'in_proj_bias') and actual_layer.self_attn.in_proj_bias is not None:
                     init.constant_(actual_layer.self_attn.in_proj_bias, 0)

                 # Initialize Output Projection
                 if hasattr(actual_layer.self_attn, 'out_proj'):
                      init.xavier_uniform_(actual_layer.self_attn.out_proj.weight)
                      if actual_layer.self_attn.out_proj.bias is not None:
                         init.constant_(actual_layer.self_attn.out_proj.bias, 0)

        # Classification Head
        if isinstance(self.fc_out, nn.Linear):
             init.xavier_uniform_(self.fc_out.weight)
             init.constant_(self.fc_out.bias, 0)
        elif isinstance(self.fc_out, nn.Sequential):
             for layer in self.fc_out:
                 if isinstance(layer, nn.Linear):
                      init.xavier_uniform_(layer.weight)
                      if layer.bias is not None: init.constant_(layer.bias, 0)

    def forward(self, src):
        # src shape: (batch_size, num_landmarks, landmark_dim)
        batch_size = src.size(0)
        coords_for_pe = src.clone() # Clone coords if needed for sinusoidal PE later

        # Landmark Dropout
        if self.training and self.landmark_dropout_p > 0:
            keep_prob = 1.0 - self.landmark_dropout_p
            landmark_mask = torch.bernoulli(torch.full((batch_size, self.num_landmarks), keep_prob, device=src.device)).unsqueeze(-1)
            if keep_prob > 0: src = src * landmark_mask / keep_prob
            else: src = src * landmark_mask

        # 1. Feature Embedding (MLP tower)
        src_embedded = self.feature_embedder(src) * math.sqrt(self.d_model) # (B, N, E)

        # 2. Positional Encoding (Learnable Index)
        indices = torch.arange(self.num_landmarks, device=src.device).unsqueeze(0).expand(batch_size, -1) # (B, N)
        pos_emb_index = self.positional_embedding(indices) # (B, N, E)

        # --- Combine Embeddings ---
        # Start with feature embedding + index embedding
        combined_emb = src_embedded + pos_emb_index

        # 2b. Optional: Add Coordinate Sinusoidal PE
        if self.use_coord_pe:
            pos_emb_layer = FlexibleCoordSinusoidalEncoding(self.d_model)  # ← create the encoding layer first
            pos_emb_coord = pos_emb_layer(coords_for_pe)                   # ← then apply it to the coords

            combined_emb = combined_emb + pos_emb_coord

        # 3. Prepend CLS token
        cls_token_batch = self.cls_token.expand(batch_size, -1, -1) # (B, 1, E)
        cls_pos_index = torch.tensor([self.num_landmarks], device=src.device).long()
        cls_pos_emb = self.positional_embedding(cls_pos_index).unsqueeze(0).expand(batch_size, -1, -1) # (B, 1, E)
        cls_token_final = cls_token_batch + cls_pos_emb # Use index embed for CLS pos

        transformer_input = torch.cat((cls_token_final, combined_emb), dim=1) # (B, N+1, E)

        # 4. Pass through Transformer Encoder Layers (with Stochastic Depth)
        x = transformer_input
        for layer in self.encoder_layers:
            # The nn.Sequential wrapper handles the StochasticDepth logic if present
            x = layer(x)
        memory = self.encoder_norm(x) # Apply final norm

        # 5. Get CLS token output
        cls_output = memory[:, 0, :] # (B, E)

        # 6. Classification Head
        x = self.dropout_final(cls_output)
        output_logits = self.fc_out(x) # (B, C)

        return output_logits

# --- Early Stopping ---
# (Class remains the same)
class EarlyStopping:
    def _init_(self, patience=7, verbose=False, delta=0, path='transformer_landmark_best_v4.pt', trace_func=print): # Changed path
        self.patience = patience
        self.verbose = verbose
        self.counter = 0
        self.best_score = None
        self.early_stop = False
        self.val_loss_min = np.inf
        self.delta = delta
        self.path = path
        self.trace_func = trace_func

    def _call_(self, val_loss, model):
        score = -val_loss
        if self.best_score is None:
            self.best_score = score
            self.save_checkpoint(val_loss, model)
        elif score < self.best_score + self.delta:
            self.counter += 1
            if self.verbose: self.trace_func(f'EarlyStopping counter: {self.counter} out of {self.patience}')
            if self.counter >= self.patience: self.early_stop = True
        else:
            self.best_score = score
            self.save_checkpoint(val_loss, model)
            self.counter = 0

    def save_checkpoint(self, val_loss, model):
        if self.verbose: self.trace_func(f'Val loss decreased ({self.val_loss_min:.6f} --> {val_loss:.6f}). Saving model to {self.path} ...')
        try: torch.save(model.state_dict(), self.path)
        except Exception as e: self.trace_func(f"Error saving checkpoint: {e}")
        self.val_loss_min = val_loss


# --- Training and Validation Functions ---
# (train_epoch and validate_epoch updated for correct EMA handling and optional scheduler step)
def train_epoch(model, dataloader, criterion, optimizer, device, scheduler, ema, step_scheduler_per_batch=False): # Added EMA, scheduler step control
    model.train()
    total_loss = 0; correct_predictions = 0; total_samples = 0
    for i, (features, labels) in enumerate(dataloader):
        features, labels = features.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(features)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        if ema is not None: ema.update() # Update EMA after optimizer step
        if step_scheduler_per_batch and scheduler is not None: scheduler.step() # Step scheduler each batch if needed

        total_loss += loss.item() * features.size(0)
        _, predicted = torch.max(outputs.data, 1)
        total_samples += labels.size(0)
        correct_predictions += (predicted == labels).sum().item()

    avg_loss = total_loss / total_samples
    accuracy = correct_predictions / total_samples
    return avg_loss, accuracy

def validate_epoch(model, dataloader, criterion, device, ema): # Added EMA
    model.eval()
    total_loss = 0; correct_predictions = 0; total_samples = 0

    eval_model = model # By default use the regular model
    if ema is not None:
         # Use EMA context manager for evaluation if EMA is enabled
         ema.store() # Store original weights
         ema.copy_to() # Copy EMA weights to model
         eval_model = model # Now model has EMA weights

    # Ensure operations below are within the EMA context if used
    with torch.no_grad():
        for features, labels in dataloader:
            features, labels = features.to(device), labels.to(device)
            outputs = eval_model(features) # Use eval_model (might have EMA weights)
            loss = criterion(outputs, labels)
            total_loss += loss.item() * features.size(0)
            _, predicted = torch.max(outputs.data, 1)
            total_samples += labels.size(0)
            correct_predictions += (predicted == labels).sum().item()

    if ema is not None:
         ema.restore() # Restore original model weights after evaluation

    avg_loss = total_loss / total_samples
    accuracy = correct_predictions / total_samples
    return avg_loss, accuracy


# --- Main Script ---
if __name__ == "__main__":
    script_start_time = time.time()
    print(f"Script started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # --- 1. Load Data ---
    print("Loading landmark data...")
    try:
        df = pd.read_csv(LANDMARK_CSV_PATH)
        labels_sr = df['emotion_label']
        non_feature_cols = ['emotion_label']
        features_df = df.drop(columns=non_feature_cols, errors='ignore') # Use errors='ignore'
        if features_df.shape[1] != NUM_LANDMARKS * LANDMARK_DIM:
             print(f"ERROR: Feature columns ({features_df.shape[1]}) != NUM_LANDMARKS*LANDMARK_DIM ({NUM_LANDMARKS*LANDMARK_DIM}).")
             exit()
        print(f"Data loaded: {features_df.shape}")
    except FileNotFoundError:
        print(f"Error: CSV file not found at {LANDMARK_CSV_PATH}. Exiting.")
        exit()
    except Exception as e:
        print(f"Error loading data: {e}. Exiting.")
        exit()

    # --- 2. Preprocessing ---
    print("Preprocessing data...")
    label_encoder = LabelEncoder()
    y_integer = label_encoder.fit_transform(labels_sr)
    NUM_CLASSES = len(label_encoder.classes_)
    print(f"Number of classes: {NUM_CLASSES}")
    print(f"Class mapping: {dict(zip(label_encoder.classes_, range(NUM_CLASSES)))}")
    X = features_df.values

    # Train/Val/Test Split
    X_temp, X_test, y_temp, y_test = train_test_split(X, y_integer, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_integer)
    relative_val_size = VALIDATION_SIZE / (1 - TEST_SIZE) if (1 - TEST_SIZE) > 0 else 0 # Avoid division by zero
    if relative_val_size >= 1.0 or relative_val_size <= 0:
        print(f"Warning: Invalid validation size calculation ({relative_val_size}). Using 0.2 of original train set.")
        # Fallback to splitting original train data if calculation is odd
        X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, random_state=RANDOM_STATE, stratify=y_temp) # Approx 0.2*0.8 = 0.2
    else:
        X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=relative_val_size, random_state=RANDOM_STATE, stratify=y_temp)

    print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # Scale Features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    print("Features scaled.")

    # Reshape for Transformer input
    try:
        X_train_reshaped = X_train_scaled.reshape(-1, NUM_LANDMARKS, LANDMARK_DIM)
        X_val_reshaped = X_val_scaled.reshape(-1, NUM_LANDMARKS, LANDMARK_DIM)
        X_test_reshaped = X_test_scaled.reshape(-1, NUM_LANDMARKS, LANDMARK_DIM)
        print(f"Features reshaped to {X_train_reshaped.shape}")
    except ValueError as e:
        print(f"Error reshaping features: {e}. Check NUM_LANDMARKS and LANDMARK_DIM.")
        exit()

    # Create Datasets/DataLoaders
    train_dataset = LandmarkDataset(X_train_reshaped, y_train)
    val_dataset = LandmarkDataset(X_val_reshaped, y_val)
    test_dataset = LandmarkDataset(X_test_reshaped, y_test)
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS, pin_memory=True)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS, pin_memory=True)

    # --- 3. Initialize Model & Training Components ---
    print("Initializing model components...")
    model = LandmarkTransformerClassifier(
        num_landmarks=NUM_LANDMARKS, landmark_dim=LANDMARK_DIM, d_model=D_MODEL, nhead=NHEAD,
        num_encoder_layers=NUM_ENCODER_LAYERS, dim_feedforward=DIM_FEEDFORWARD,
        num_classes=NUM_CLASSES, dropout=DROPOUT_RATE, landmark_dropout_p=LANDMARK_DROPOUT_P,
        stochastic_depth_prob=STOCHASTIC_DEPTH_PROB,
        use_coord_pe=USE_COORD_SINUSOIDAL_PE, # Pass config flag
        use_mlp_head=USE_MLP_HEAD           # Pass config flag
    ).to(DEVICE)

    criterion = nn.CrossEntropyLoss(label_smoothing=LABEL_SMOOTHING)
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)

    # Scheduler (Warmup + Cosine Decay - steps per batch/iteration)
    num_training_steps = len(train_loader) * EPOCHS
    num_warmup_steps = len(train_loader) * WARMUP_EPOCHS
    def lr_lambda_func(current_step):
        if current_step < num_warmup_steps:
            return float(current_step) / float(max(1.0, num_warmup_steps))
        progress = float(current_step - num_warmup_steps) / float(max(1.0, num_training_steps - num_warmup_steps))
        return max(0.0, 0.5 * (1.0 + math.cos(math.pi * progress)))
    scheduler = LambdaLR(optimizer, lr_lambda=lr_lambda_func) # This needs step per iteration

    early_stopping = EarlyStopping(patience=PATIENCE, verbose=True, path='transformer_landmark_best_v4.pt')
    ema = ExponentialMovingAverage(model.parameters(), decay=EMA_DECAY) if USE_EMA else None

    print(f"Model Parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}")
    print(f"Using EMA: {USE_EMA}")
    print(f"Using Stochastic Depth: {STOCHASTIC_DEPTH_PROB > 0 and _stochastic_depth_available}")
    print(f"Using Sinusoidal Coord PE: {USE_COORD_SINUSOIDAL_PE}")
    print(f"Using MLP Head: {USE_MLP_HEAD}")

    # --- 4. Training Loop ---
    print(f"Starting training for {EPOCHS} epochs...")
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': [], 'lr': []}
    start_train_time = time.time()
    global_step = 0

    for epoch in range(EPOCHS):
        # --- Training Epoch ---
        model.train()
        epoch_train_loss = 0; epoch_train_correct = 0; epoch_train_samples = 0
        for i, (features, labels) in enumerate(train_loader):
            features, labels = features.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(features)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            if ema is not None: ema.update()
            # Step the scheduler each iteration
            scheduler.step() # LambdaLR based on step needs step here
            global_step += 1

            epoch_train_loss += loss.item() * features.size(0)
            _, predicted = torch.max(outputs.data, 1)
            epoch_train_samples += labels.size(0)
            epoch_train_correct += (predicted == labels).sum().item()
        train_loss = epoch_train_loss / epoch_train_samples
        train_acc = epoch_train_correct / epoch_train_samples

        # --- Validation Epoch ---
        val_loss, val_acc = validate_epoch(model, val_loader, criterion, DEVICE, ema) # Pass EMA

        current_lr = optimizer.param_groups[0]['lr'] # Get LR after potential scheduler step
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        history['lr'].append(current_lr)

        print(f"Epoch {epoch+1:03d}/{EPOCHS} | LR: {current_lr:.6f} | "
              f"Train Loss: {train_loss:.4f}, Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f}, Acc: {val_acc:.4f} | "
              f"Best Val Loss: {early_stopping.val_loss_min:.4f}")

        # Early stopping checks validation loss
        early_stopping(val_loss, model)
        if early_stopping.early_stop:
            print("Early stopping triggered.")
            break

    end_train_time = time.time()
    print(f"\nTraining finished in {(end_train_time - start_train_time)/60:.2f} minutes.")

    # --- 5. Load Best Model Weights ---
    print(f"Loading best non-EMA model weights from {early_stopping.path} for final evaluation...")
    try:
        model.load_state_dict(torch.load(early_stopping.path, map_location=DEVICE))
        print("Best non-EMA weights loaded.")
    except FileNotFoundError:
        print(f"Warning: Checkpoint file not found at {early_stopping.path}. Evaluating with final weights.")
    except Exception as e:
        print(f"Could not load best weights: {e}. Evaluating with final weights.")

    # --- 6. Plot Training History ---
    print("Plotting training history...")
    # (Plotting - same as before)
    try:
        epochs_range = range(1, len(history['train_loss']) + 1)
        fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(10, 15), sharex=True)
        ax1.plot(epochs_range, history['train_acc'], label='Train Accuracy', marker='.')
        ax1.plot(epochs_range, history['val_acc'], label=f"Validation Accuracy ({'EMA' if USE_EMA else 'Standard'})", marker='.')
        ax1.set_title('Accuracy'); ax1.set_ylabel('Accuracy'); ax1.legend(loc='best'); ax1.grid(True)
        ax2.plot(epochs_range, history['train_loss'], label='Train Loss', marker='.')
        ax2.plot(epochs_range, history['val_loss'], label=f"Validation Loss ({'EMA' if USE_EMA else 'Standard'})", marker='.')
        ax2.set_title('Loss'); ax2.set_ylabel('Loss'); ax2.legend(loc='best'); ax2.grid(True)
        ax3.plot(epochs_range, history['lr'], label='Learning Rate', marker='.')
        ax3.set_title('Learning Rate'); ax3.set_ylabel('LR'); ax3.set_xlabel('Epoch'); ax3.legend(loc='best'); ax3.grid(True)
        plt.tight_layout(); plt.show()
    except Exception as e: print(f"Error plotting history: {e}")


    # --- 7. Evaluate on Test Set ---
    print(f"\nEvaluating on test set using {'EMA' if USE_EMA else 'standard'} weights...")
    model.eval()
    all_preds = []
    all_labels = []

    eval_context = ema.average_parameters() if USE_EMA else contextlib.nullcontext() # Use EMA context only if enabled
    # Need to import contextlib
    import contextlib

    with eval_context:
        with torch.no_grad():
            for features, labels in test_loader:
                features = features.to(DEVICE)
                outputs = model(features) # Uses EMA weights if context active
                _, predicted = torch.max(outputs.data, 1)
                all_preds.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
    # EMA weights automatically restored after context manager exits if ema was used

    test_accuracy = accuracy_score(all_labels, all_preds)
    print(f"Final Test Accuracy ({'EMA' if USE_EMA else 'Standard'}): {test_accuracy:.4f}")

    print(f"\nTest Classification Report ({'EMA' if USE_EMA else 'Standard'}):")
    print(classification_report(all_labels, all_preds, target_names=label_encoder.classes_, zero_division=0))

    print(f"\nTest Confusion Matrix ({'EMA' if USE_EMA else 'Standard'}):")
    try:
        cm = confusion_matrix(all_labels, all_preds)
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=label_encoder.classes_)
        fig, ax = plt.subplots(figsize=(8, 8)); disp.plot(cmap=plt.cm.Blues, ax=ax)
        plt.xticks(rotation=45, ha='right'); plt.tight_layout(); plt.show()
    except Exception as e: print(f"Error displaying confusion matrix: {e}")

    print("\nScript finished.")
    end_script_time = time.time()
    print(f"Total script execution time: {(end_script_time - script_start_time)/60:.2f} minutes")