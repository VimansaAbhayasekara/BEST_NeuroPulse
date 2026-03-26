#!/usr/bin/env python3
import tensorflow as tf
import pickle
import numpy as np

print("=" * 60)
print("DEBUGGING MODEL AND SCALER")
print("=" * 60)

# Load model
model_path = "model_assets/neuropulse_model.h5"
print(f"\n1. Loading model from {model_path}...")

try:
    # Rebuild model architecture
    from tensorflow.keras import layers, Model, regularizers
    
    # Try to get shape from metadata or use default
    n_timesteps, n_features = 23, 11  # Default guess
    
    inp = layers.Input(shape=(n_timesteps, n_features), name="eeg_input")
    l2 = 1e-4
    dr = 0.35
    x = layers.Conv1D(64, 3, padding="same", activation="relu", kernel_regularizer=regularizers.l2(l2))(inp)
    x = layers.BatchNormalization()(x)
    x = layers.Conv1D(128, 3, padding="same", activation="relu", kernel_regularizer=regularizers.l2(l2))(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling1D(pool_size=2, padding="same")(x)
    x = layers.Dropout(dr)(x)
    x = layers.Bidirectional(layers.GRU(128, return_sequences=True, dropout=dr, recurrent_dropout=0.1))(x)
    x = layers.Bidirectional(layers.GRU(64, return_sequences=False, dropout=dr, recurrent_dropout=0.1))(x)
    x = layers.Dense(64, activation="relu", kernel_regularizer=regularizers.l2(l2))(x)
    x = layers.Dropout(dr/2)(x)
    x = layers.Dense(32, activation="relu", kernel_regularizer=regularizers.l2(l2))(x)
    out = layers.Dense(1, activation="linear", name="mmse_output")(x)
    
    model = Model(inp, out)
    model.load_weights(model_path)
    
    print(f"✓ Model loaded successfully!")
    print(f"  Input shape: {model.input_shape}")
    print(f"  Output shape: {model.output_shape}")
    
    n_timesteps = model.input_shape[1]
    n_features = model.input_shape[2]
    total_features = n_timesteps * n_features
    
    print(f"\n  Timesteps (channels): {n_timesteps}")
    print(f"  Features per channel: {n_features}")
    print(f"  Total features expected: {total_features}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print("Trying to inspect H5 file directly...")
    
    import h5py
    with h5py.File(model_path, 'r') as f:
        print("\nH5 file structure:")
        for key in f.keys():
            print(f"  - {key}")
        
        if 'model_weights' in f:
            print("\nModel weights layers:")
            for layer in f['model_weights'].keys():
                print(f"  - {layer}")

# Load scaler
scaler_path = "model_assets/scaler.pkl"
print(f"\n2. Loading scaler from {scaler_path}...")

try:
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    
    print(f"✓ Scaler loaded successfully!")
    print(f"  Scaler features: {scaler.mean_.shape[0]}")
    print(f"  Scaler mean (first 10): {scaler.mean_[:10]}")
    print(f"  Scaler scale (first 10): {scaler.scale_[:10]}")
    
    if 'total_features' in locals():
        if scaler.mean_.shape[0] != total_features:
            print(f"\n⚠️  MISMATCH DETECTED!")
            print(f"  Model expects: {total_features} features")
            print(f"  Scaler has: {scaler.mean_.shape[0]} features")
            print(f"  Difference: {scaler.mean_.shape[0] - total_features}")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "=" * 60)
print("RECOMMENDATION:")
print("If there's a mismatch, you need to:")
print("1. Check your training notebook for the exact X_aug shape")
print("2. Recreate the scaler with the correct feature count")
print("=" * 60)