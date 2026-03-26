export type AnalysisState = 'IDLE' | 'VALIDATING' | 'VALID' | 'INVALID' | 'ANALYZING' | 'RESULTS'

export interface SeverityBand {
  band: 'Normal' | 'Mild' | 'Moderate' | 'Severe'
  range: string
  color: string
  description: string
  recommendation: string
}

export interface BandPowers {
  delta: number
  theta: number
  alpha: number
  beta: number
  gamma: number
}

export interface SpectralRatios {
  theta_alpha_ratio: number
  delta_alpha_ratio: number
  slowing_index: number
}

export interface ChannelValue {
  channel: string
  value: number
}

export interface ChannelImportance {
  channel: string
  shap_value: number
}

export interface FeatureImportance {
  feature: string
  shap_value: number
  clinical_meaning: string
  direction: 'increases MMSE' | 'decreases MMSE' | 'unknown'
  rank: number
}

export interface XAIText {
  feature_sentences: string[]
  clinical_summary: string
  top_channel: string
  recommendation: string
  disclaimer: string
}

export interface EEGStats {
  n_channels: number
  n_epochs: number
  sfreq: number
  epoch_sec: number
  total_duration_sec: number
  filename: string
}

export interface PredictionResponse {
  predicted_mmse: number
  mmse_per_epoch: number[]
  severity: SeverityBand
  band_powers: BandPowers
  spectral_ratios: SpectralRatios
  channel_delta: ChannelValue[]
  channel_theta: ChannelValue[]
  feature_importance: FeatureImportance[]
  channel_importance: ChannelImportance[]
  xai_text: XAIText
  eeg_stats: EEGStats
}

export interface ValidationResponse {
  valid: boolean
  message: string
  filename: string
}
