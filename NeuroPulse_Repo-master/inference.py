#!/usr/bin/env python3
"""
inference.py - NeuroPulse EEG Inference Script
Version: 6.0 - Clean JSON output only
"""

import sys
import os
import json
import warnings
import numpy as np
import time
import pickle

warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# ============================================================================
# IMPORTS
# ============================================================================
import tensorflow as tf
from tensorflow import keras
import mne
from scipy.signal import welch, butter, sosfiltfilt

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(SCRIPT_DIR, "model_assets")

MODEL_PATH = os.path.join(ASSETS_DIR, "neuropulse_model.keras")
SCALER_PATH = os.path.join(ASSETS_DIR, "scaler.pkl")

MODEL_CHANNELS = 19
FEATURES_PER_CHANNEL = 12
SFREQ = 500.0
EPOCH_SEC = 4.0
OVERLAP_SEC = 2.0

BANDS = {
    "delta": (0.5, 4.0),
    "theta": (4.0, 8.0),
    "alpha": (8.0, 13.0),
    "beta": (13.0, 30.0),
    "gamma": (30.0, 45.0),
}

CH_NAMES_19 = [
    "Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",
    "T3", "C3", "Cz", "C4", "T4",
    "T5", "P3", "Pz", "P4", "T6", "O1", "O2"
]

FEATURE_NAMES = [
    "delta", "theta", "alpha", "beta", "gamma",
    "theta_alpha_ratio", "delta_alpha_ratio", "slowing_index",
    "hjorth_activity", "hjorth_mobility", "hjorth_complexity", "hjorth_norm_mob"
]

CLINICAL_MEANINGS = {
    "delta": "Slow-wave cortical activity — elevated in severe dementia",
    "theta": "Theta slowing — earliest EEG marker of cognitive decline",
    "alpha": "Alpha suppression — hallmark of Alzheimer's Disease",
    "beta": "Beta reduction — associated with executive function decline",
    "gamma": "Gamma disruption — high-frequency binding deficits",
    "theta_alpha_ratio": "Primary AD biomarker — rises as alpha is suppressed",
    "delta_alpha_ratio": "Overall cortical slowing index",
    "slowing_index": "Combined delta+theta dominance over alpha+beta",
    "hjorth_activity": "Cortical activation level",
    "hjorth_mobility": "Mean frequency proxy — reduced in dementia",
    "hjorth_complexity": "Signal irregularity — reduced in cognitive decline",
    "hjorth_norm_mob": "Normalised frequency metric"
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def to_serializable(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.float16, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.int8, np.int16, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, dict):
        return {k: to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [to_serializable(item) for item in obj]
    return obj

def mmse_to_severity(score):
    score = float(score)
    if score >= 24:
        return {
            "band": "Normal",
            "range": "24-30",
            "color": "#22c55e",
            "description": "No significant cognitive impairment detected.",
            "recommendation": "Routine monitoring recommended."
        }
    elif score >= 18:
        return {
            "band": "Mild",
            "range": "18-23",
            "color": "#f59e0b",
            "description": "Mild cognitive impairment detected.",
            "recommendation": "Further clinical assessment recommended."
        }
    elif score >= 10:
        return {
            "band": "Moderate",
            "range": "10-17",
            "color": "#f97316",
            "description": "Moderate dementia patterns detected.",
            "recommendation": "Specialist referral advised."
        }
    else:
        return {
            "band": "Severe",
            "range": "0-9",
            "color": "#ef4444",
            "description": "Severe cognitive impairment detected.",
            "recommendation": "Immediate clinical intervention required."
        }

# ============================================================================
# MODEL LOADING
# ============================================================================

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
    return keras.models.load_model(MODEL_PATH)

def load_scaler():
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Scaler not found: {SCALER_PATH}")
    with open(SCALER_PATH, 'rb') as f:
        return pickle.load(f)

# ============================================================================
# EEG PROCESSING FUNCTIONS
# ============================================================================

def load_raw_set(filepath):
    try:
        raw = mne.io.read_raw_eeglab(filepath, preload=True, verbose=False)
        return raw
    except Exception:
        from pymatreader import read_mat
        mat = read_mat(filepath)
        
        if 'EEG' in mat:
            eeg = mat['EEG']
            data = np.array(eeg['data'], dtype=np.float64)
            sfreq_r = float(eeg.get('srate', SFREQ))
        elif 'data' in mat:
            data = np.array(mat['data'], dtype=np.float64)
            sfreq_r = float(mat.get('srate', SFREQ))
        else:
            raise ValueError("No data key found")
        
        if data.ndim == 3:
            data = data.reshape(data.shape[0], -1)
        if data.shape[0] > data.shape[1]:
            data = data.T
        
        n_ch = data.shape[0]
        chs = CH_NAMES_19[:n_ch] if n_ch <= 19 else [f'EEG{i:03d}' for i in range(n_ch)]
        info = mne.create_info(ch_names=chs, sfreq=sfreq_r, ch_types='eeg')
        raw = mne.io.RawArray(data, info, verbose=False)
        return raw

def preprocess_raw_eeg(raw):
    raw.pick_types(eeg=True, verbose=False)
    
    raw.filter(l_freq=0.5, h_freq=45.0, method='iir',
               iir_params={'order': 4, 'ftype': 'butter'},
               verbose=False)
    
    ref_chs = [c for c in raw.ch_names if c in ('A1', 'A2', 'M1', 'M2', 'TP9', 'TP10')]
    if len(ref_chs) >= 1:
        raw.set_eeg_reference(ref_channels=ref_chs, verbose=False)
    else:
        raw.set_eeg_reference(ref_channels='average', verbose=False)
    
    data_np = raw.get_data()
    baseline_sd = np.median(np.std(data_np, axis=1))
    threshold = 17.0 * baseline_sd
    win_samples = int(0.5 * raw.info['sfreq'])
    n_times = data_np.shape[1]
    
    bad_onsets = []
    for start in range(0, n_times - win_samples, win_samples // 2):
        win = data_np[:, start:start + win_samples]
        if np.std(win) > threshold:
            bad_onsets.append(start / raw.info['sfreq'])
    
    if bad_onsets:
        annotations = mne.Annotations(
            onset=np.array(bad_onsets),
            duration=np.full(len(bad_onsets), 0.5),
            description=['BAD_asr'] * len(bad_onsets)
        )
        raw.set_annotations(annotations, verbose=False)
    
    n_ch = len(raw.ch_names)
    n_ica = min(n_ch, 10)
    
    if raw.n_times > n_ica * raw.info['sfreq'] * 2:
        try:
            ica = mne.preprocessing.ICA(
                n_components=n_ica,
                method='fastica',
                max_iter=200,
                random_state=42,
                verbose=False
            )
            ica.fit(raw, verbose=False)
            
            eog_indices, _ = ica.find_bads_eog(
                raw, ch_name='Fp1' if 'Fp1' in raw.ch_names else raw.ch_names[0],
                threshold=2.5, verbose=False
            )
            
            if eog_indices:
                ica.exclude = eog_indices
                ica.apply(raw, verbose=False)
            
            del ica
        except Exception:
            pass
    
    return raw

def extract_features_fast(raw, max_epochs=20):
    data = raw.get_data() * 1e6
    sfreq = raw.info['sfreq']
    n_ch, n_times = data.shape
    
    step = int(EPOCH_SEC * sfreq)
    hop = int(OVERLAP_SEC * sfreq)
    nfft = min(step, int(4 * sfreq))
    
    if step > n_times:
        step = n_times
        hop = step
    
    starts = list(range(0, n_times - step + 1, hop))
    if not starts:
        starts = [0]
    
    if len(starts) > max_epochs:
        indices = np.linspace(0, len(starts)-1, max_epochs, dtype=int)
        starts = [starts[i] for i in indices]
    
    all_epochs = []
    
    for start in starts:
        seg = data[:, start:start+step]
        epoch_feats = []
        
        for ch in range(n_ch):
            x = seg[ch]
            
            try:
                freqs, psd = welch(x, fs=sfreq, nperseg=nfft, 
                                  window='hann', average='median')
            except:
                freqs = np.linspace(0, sfreq/2, nfft//2)
                psd = np.abs(np.fft.rfft(x, n=nfft))**2 / (sfreq * nfft)
                psd = psd[:len(freqs)]
            
            band_powers = {}
            for name, (low, high) in BANDS.items():
                mask = (freqs >= low) & (freqs < high)
                if mask.any():
                    power = np.trapz(psd[mask], freqs[mask])
                else:
                    power = 1e-12
                band_powers[name] = np.log1p(power)
                epoch_feats.append(band_powers[name])
            
            theta_a = band_powers['theta']
            alpha_a = band_powers['alpha']
            delta_a = band_powers['delta']
            beta_a = band_powers['beta']
            
            epoch_feats.append(theta_a / (alpha_a + 1e-12))
            epoch_feats.append(delta_a / (alpha_a + 1e-12))
            epoch_feats.append((delta_a + theta_a) / (alpha_a + beta_a + 1e-12))
            
            d1 = np.diff(x)
            d2 = np.diff(d1)
            var_x = np.var(x) + 1e-12
            var_d1 = np.var(d1) + 1e-12
            var_d2 = np.var(d2) + 1e-12
            
            activity = np.log1p(var_x)
            mobility = np.sqrt(var_d1 / var_x)
            complexity = np.sqrt(var_d2 / var_d1) / (mobility + 1e-12)
            norm_mob = mobility / (np.sqrt(var_x) + 1e-12)
            
            epoch_feats.extend([activity, mobility, complexity, norm_mob])
        
        all_epochs.append(epoch_feats)
    
    return np.array(all_epochs, dtype=np.float32)

# ============================================================================
# MAIN INFERENCE FUNCTIONS
# ============================================================================

_model = None
_scaler = None

def load_assets():
    global _model, _scaler
    if _model is None:
        _model = load_model()
    if _scaler is None:
        _scaler = load_scaler()
    return _model, _scaler

def validate_file(filepath, filename):
    if not filename.lower().endswith(".set"):
        return {"valid": False, "message": "File must have .set extension", "filename": filename}
    
    if not os.path.exists(filepath):
        return {"valid": False, "message": "File not found", "filename": filename}
    
    try:
        raw = load_raw_set(filepath)
        data = raw.get_data()
        sfreq = raw.info['sfreq']
        return {
            "valid": True,
            "message": f"Valid EEG: {data.shape[0]} channels, {sfreq} Hz",
            "filename": filename,
            "n_channels": data.shape[0],
            "sfreq": sfreq
        }
    except Exception as e:
        return {"valid": False, "message": str(e), "filename": filename}

def predict_file(filepath, filename):
    start_time = time.time()
    
    try:
        model, scaler = load_assets()
        
        raw = load_raw_set(filepath)
        n_actual_channels = len(raw.ch_names)
        
        raw = preprocess_raw_eeg(raw)
        
        X_flat = extract_features_fast(raw)
        n_epochs = X_flat.shape[0]
        
        if n_epochs == 0:
            result = {"error": "No valid epochs extracted from EEG", "success": False}
            print(json.dumps(result, ensure_ascii=False))
            return
        
        X_scaled = scaler.transform(X_flat).astype(np.float32)
        n_ch = X_flat.shape[1] // FEATURES_PER_CHANNEL
        X_3d = X_scaled.reshape(n_epochs, n_ch, FEATURES_PER_CHANNEL)
        
        epoch_predictions = model.predict(X_3d, verbose=0).flatten()
        predicted_mmse = float(np.median(epoch_predictions))
        predicted_mmse = max(0, min(30, predicted_mmse))
        pred_std = float(np.std(epoch_predictions))
        
        band_powers = {}
        for i, band in enumerate(["delta", "theta", "alpha", "beta", "gamma"]):
            indices = [ch * FEATURES_PER_CHANNEL + i for ch in range(n_ch)]
            valid_idx = [idx for idx in indices if idx < X_flat.shape[1]]
            if valid_idx:
                mean_log = float(X_flat[:, valid_idx].mean())
                band_powers[band] = round(float(np.expm1(max(mean_log, 0))), 4)
            else:
                band_powers[band] = 0.0
        
        theta = band_powers["theta"]
        alpha = band_powers["alpha"]
        delta = band_powers["delta"]
        beta = band_powers["beta"]
        
        spectral_ratios = {
            "theta_alpha_ratio": round(theta / (alpha + 1e-12), 4),
            "delta_alpha_ratio": round(delta / (alpha + 1e-12), 4),
            "slowing_index": round((delta + theta) / (alpha + beta + 1e-12), 4)
        }
        
        feature_importance = []
        for i, feat_name in enumerate(FEATURE_NAMES[:FEATURES_PER_CHANNEL]):
            feat_vals = X_flat[:, i::FEATURES_PER_CHANNEL].mean(axis=1)
            corr = np.corrcoef(feat_vals, epoch_predictions)[0, 1]
            if not np.isnan(corr):
                direction = "increases" if corr > 0 else "decreases"
                feature_importance.append({
                    "feature": feat_name,
                    "shap_value": round(abs(corr), 4),
                    "clinical_meaning": CLINICAL_MEANINGS.get(feat_name, ""),
                    "direction": direction,
                    "rank": i + 1
                })
        
        feature_importance.sort(key=lambda x: x["shap_value"], reverse=True)
        
        channel_importance = []
        for ch in range(min(n_actual_channels, len(CH_NAMES_19))):
            ch_vals = X_3d[:, ch, :].mean(axis=1)
            corr = np.corrcoef(ch_vals, epoch_predictions)[0, 1]
            if not np.isnan(corr):
                channel_importance.append({
                    "channel": CH_NAMES_19[ch],
                    "shap_value": round(abs(corr), 4)
                })
        
        channel_importance.sort(key=lambda x: x["shap_value"], reverse=True)
        
        severity = mmse_to_severity(predicted_mmse)
        
        xai_text = {
            "feature_sentences": [
                f"{f['feature']}: {f['shap_value']:.3f} importance. {f['clinical_meaning']}"
                for f in feature_importance[:3]
            ],
            "clinical_summary": (
                f"EEG patterns consistent with {severity['band'].lower()} function (MMSE={predicted_mmse:.1f}/30). "
                f"Delta: {band_powers['delta']:.3f}, Theta: {band_powers['theta']:.3f}, "
                f"Alpha: {band_powers['alpha']:.3f}. "
                f"Theta/Alpha ratio: {spectral_ratios['theta_alpha_ratio']:.3f}."
            ),
            "top_channel": channel_importance[0]["channel"] if channel_importance else "Pz",
            "recommendation": severity["recommendation"],
            "disclaimer": "This prediction is for research purposes only."
        }
        
        result = {
            "predicted_mmse": round(predicted_mmse, 2),
            "mmse_confidence_std": round(pred_std, 2),
            "mmse_per_epoch": [round(float(v), 2) for v in epoch_predictions[:20]],
            "severity": severity,
            "band_powers": band_powers,
            "spectral_ratios": spectral_ratios,
            "feature_importance": feature_importance[:8],
            "channel_importance": channel_importance[:10],
            "xai_text": xai_text,
            "eeg_stats": {
                "n_channels": int(n_actual_channels),
                "n_epochs": int(n_epochs),
                "sfreq": float(raw.info['sfreq']),
                "epoch_sec": float(EPOCH_SEC),
                "filename": filename,
                "inference_time_sec": round(time.time() - start_time, 2)
            },
            "success": True
        }
        
        # Print ONLY the JSON to stdout
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_result = {"error": "Inference failed", "detail": str(e), "success": False}
        print(json.dumps(error_result, ensure_ascii=False))

# ============================================================================
# ENTRY POINT
# ============================================================================

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python inference.py <validate|predict> <file_path>"}))
        sys.exit(1)
    
    mode = sys.argv[1].strip().lower()
    filepath = sys.argv[2].strip()
    filename = os.path.basename(filepath)
    
    if mode == "validate":
        result = validate_file(filepath, filename)
        print(json.dumps(result, ensure_ascii=False))
    elif mode == "predict":
        predict_file(filepath, filename)
    else:
        print(json.dumps({"error": f"Unknown mode: {mode}", "success": False}, ensure_ascii=False))

if __name__ == "__main__":
    main()