#!/usr/bin/env python3
import h5py
import numpy as np

print("=" * 60)
print("EXTRACTING MODEL ARCHITECTURE FROM H5 FILE")
print("=" * 60)

model_path = "model_assets/neuropulse_model.h5"

with h5py.File(model_path, 'r') as f:
    print("\n1. Model structure:")
    for key in f.keys():
        print(f"   - {key}")
    
    # Check weights shapes to determine layer sizes
    if 'model_weights' in f:
        print("\n2. Layer weights shapes:")
        
        # Check conv1 layer
        if 'conv1' in f['model_weights']:
            conv1_weights = f['model_weights']['conv1']['conv1']['kernel:0']
            print(f"   conv1 weights shape: {conv1_weights.shape}")
            # conv1_weights shape: (kernel_size, input_channels, output_channels)
            # kernel_size = 3, output_channels = 64
            input_channels = conv1_weights.shape[1]
            print(f"      → Input channels (features per timestep): {input_channels}")
        
        # Check bigru1 layer
        if 'bigru1' in f['model_weights']:
            gru_weights = f['model_weights']['bigru1']['forward_gru']['kernel:0']
            print(f"   bigru1 weights shape: {gru_weights.shape}")
            # GRU weights: (input_dim, units * 3)
            input_dim = gru_weights.shape[0]
            print(f"      → Input dimension: {input_dim}")
            
            # Calculate timesteps from conv output
            # conv1 output channels = 64, maxpool reduces by 2, so timesteps = conv_timesteps/2
            # We can infer original timesteps from this
            
        # Check input layer
        if 'eeg_input' in f['model_weights']:
            print("\n3. Input layer present")
        
        # Try to get the actual shape from the first dense layer
        if 'dense1' in f['model_weights']:
            dense_weights = f['model_weights']['dense1']['dense1']['kernel:0']
            print(f"   dense1 weights shape: {dense_weights.shape}")
            print(f"      → Input features to dense1: {dense_weights.shape[0]}")

print("\n" + "=" * 60)
print("Based on the weights, your model expects:")
print("- Conv1D expects input with N timesteps and F features per timestep")
print("- The exact shape can be inferred from the first layer's input dimension")
print("=" * 60)