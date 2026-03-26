#!/usr/bin/env python3
import tensorflow as tf
import os

print("Loading model...")
model_path = "model_assets/neuropulse_model.h5"

if os.path.exists(model_path):
    try:
        model = tf.keras.models.load_model(model_path, compile=False)
        print(f"✓ Model loaded successfully")
        print(f"  Input shape: {model.input_shape}")
        print(f"  Output shape: {model.output_shape}")
        
        if model.input_shape and len(model.input_shape) == 3:
            n_timesteps = model.input_shape[1]
            n_features = model.input_shape[2]
            total_features = n_timesteps * n_features
            print(f"\n  Timesteps (channels): {n_timesteps}")
            print(f"  Features per channel: {n_features}")
            print(f"  Total features: {total_features}")
        else:
            print(f"  Unexpected input shape format: {model.input_shape}")
            
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        
        # Try to inspect the H5 file directly
        import h5py
        print("\nInspecting H5 file structure...")
        with h5py.File(model_path, 'r') as f:
            print("Keys in file:", list(f.keys()))
            if 'model_weights' in f:
                print("Model weights keys:", list(f['model_weights'].keys()))
else:
    print(f"Model not found at {model_path}")