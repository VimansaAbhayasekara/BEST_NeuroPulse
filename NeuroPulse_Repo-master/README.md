# NeuroPulse

AI-powered EEG cognitive assessment — predicts MMSE score from resting-state EEG recordings.

---

## Setup in 4 steps

### Step 1 — Add your model files

Create (or open) the `model_assets/` folder inside this project.
Copy these three files into it:

```
model_assets/
  neuropulse_model.h5     ← from your Google Drive model_package.zip
  scaler.pkl              ← from your Google Drive model_package.zip
  metadata.json           ← from your Google Drive model_package.zip
```

Download `neuropulse_model_package.zip` from:
`Google Drive → NeuroPulse_Dataset → outputs → model_package`

---

### Step 2 — Install Python packages (run once)

Open a terminal in this folder and run:

```
pip install tensorflow==2.15.0 numpy==1.26.4 scipy==1.13.0 pymatreader==0.0.30 shap==0.45.0 scikit-learn==1.4.2 h5py
```

---

### Step 3 — Install Node packages (run once)

```
npm install
```

---

### Step 4 — Start the app

```
npm run dev
```

Open http://localhost:3000

---

## If you get a model loading error (Python 3.11 fix)

If you see an error about `batch_shape` or `InputLayer`, run this in your
Colab notebook to convert the model to SavedModel format:

```python
import tensorflow as tf

model = tf.keras.models.load_model(
    '/content/drive/MyDrive/NeuroPulse/NeuroPulse_Dataset/outputs/model_package/neuropulse_model.h5'
)
model.save(
    '/content/drive/MyDrive/NeuroPulse/NeuroPulse_Dataset/outputs/model_package/neuropulse_savedmodel'
)
print("Done. Input shape:", model.input_shape)
```

Then download the `neuropulse_savedmodel` folder from Drive and place it
inside `model_assets/` alongside the other files:

```
model_assets/
  neuropulse_savedmodel/   ← folder downloaded from Drive
  scaler.pkl
  metadata.json
```

The app will automatically use SavedModel format if it finds the folder.

---

## How to get a test .set file

Run this in your Colab notebook to find available EEG files:

```python
import os
for root, _, files in os.walk(DERIV_DIR):
    for f in files:
        if f.endswith('.set'):
            print(os.path.join(root, f))
```

Download any one of those files from Google Drive to your computer.
Use it as the upload file in the app.

---

## What the app does

1. You upload a .set EEG file
2. The file is validated automatically
3. You click Analyze EEG
4. The CNN+GRU model predicts the MMSE cognitive score (0-30)
5. Results show:
   - MMSE score with animated count-up
   - Severity band (Normal / Mild / Moderate / Severe)
   - Brainwave band power radar and bar charts
   - Epoch-by-epoch prediction stability timeline
   - SHAP XAI feature importance
   - Electrode contribution ranking
   - Plain-English clinical interpretation
   - EEG recording statistics
6. Download a text report of all findings
