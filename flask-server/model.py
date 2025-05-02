# model.py
import torch
import torch.nn as nn

class TransformerEncoderLayer(nn.Module):
    def __init__(self, head_size, num_heads, ff_dim, dropout=0.1):
        super(TransformerEncoderLayer, self).__init__()
        self.attention = nn.MultiheadAttention(embed_dim=head_size, num_heads=num_heads, dropout=dropout)
        self.norm1 = nn.LayerNorm(head_size)
        self.norm2 = nn.LayerNorm(head_size)
        self.ffn = nn.Sequential(
            nn.Linear(head_size, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, head_size)
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        attn_output, _ = self.attention(x, x, x)
        x = self.norm1(attn_output + x)
        ffn_output = self.ffn(x)
        x = self.norm2(ffn_output + x)
        return x

class TransformerModel(nn.Module):
    def __init__(self, input_dim=3, seq_len=478, num_classes=8, head_size=128, num_heads=8, ff_dim=256, num_layers=4, dropout=0.2):
        super(TransformerModel, self).__init__()
        self.embedding = nn.Linear(input_dim, head_size)
        self.encoders = nn.ModuleList([
            TransformerEncoderLayer(head_size, num_heads, ff_dim, dropout) for _ in range(num_layers)
        ])
        self.fc = nn.Linear(head_size, num_classes)

    def forward(self, x):
        x = self.embedding(x)
        for encoder in self.encoders:
            x = encoder(x)
        x = x.mean(dim=1)  # Global average pooling
        x = self.fc(x)
        return x
