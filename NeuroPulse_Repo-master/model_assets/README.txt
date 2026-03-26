Place these three files here before running the app:

  neuropulse_model.h5       — trained TF/Keras CNN+GRU model
  scaler.pkl                — StandardScaler fitted during training
  metadata.json             — model config and feature names

All three come from your Google Drive:
  NeuroPulse_Dataset/outputs/model_package/

Download neuropulse_model_package.zip, unzip it, copy the files here.

Optional (recommended for Python 3.11 compatibility):
  neuropulse_savedmodel/    — SavedModel format folder
  (see README.md for how to generate this in Colab)
