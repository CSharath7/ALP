import torch
import torch.nn as nn

class LandmarkTransformer(nn.Module):
    def __init__(self, num_classes=6):
        super(LandmarkTransformer, self).__init__()
        self.model = nn.Sequential(
            nn.Linear(478 * 3, 512),  # 478 landmarks * 3 coordinates (x, y, z)
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        return self.model(x)
