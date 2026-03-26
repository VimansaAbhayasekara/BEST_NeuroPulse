#!/usr/bin/env python3
import pickle
import numpy as np
import sys

print("=" * 60)
print("FIXING SCALER COMPATIBILITY")
print("=" * 60)

scaler_path = "model_assets/scaler.pkl"
backup_path = "model_assets/scaler_backup.pkl"

# Backup original
import shutil
if os.path.exists(scaler_path):
    shutil.copy2(scaler_path, backup_path)
    print(f"✓ Backed up to {backup_path}")

# Try to load with different methods
print("\nAttempting to load scaler...")

# Method 1: Try with numpy's old API
try:
    # This is the key - load with allow_pickle and specific encoding
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f, encoding='latin1')
    print("✓ Scaler loaded successfully!")
    print(f"  Features: {scaler.mean_.shape[0]}")
    print(f"  Mean (first 5): {scaler.mean_[:5]}")
    
    # Save with current numpy
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print("✓ Scaler re-saved with current numpy version")
    
except Exception as e:
    print(f"✗ Loading failed: {e}")
    print("\nYou need to recreate the scaler from your training data in Colab.")
    print("\nIn your Colab notebook, run:")
    print("""
import pickle
import numpy as np

# Load your training data
X_aug = np.load('/content/drive/MyDrive/NeuroPulse/NeuroPulse_Dataset/outputs/X_band_feats.npy')
print(f"X_aug shape: {X_aug.shape}")

# Recreate scaler
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
scaler.fit(X_aug)

# Save
with open('scaler_correct.pkl', 'wb') as f:
    pickle.dump(scaler, f)

# Download
from google.colab import files
files.download('scaler_correct.pkl')
    """)