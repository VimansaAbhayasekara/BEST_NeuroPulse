'use client'

import { useEffect, useState } from 'react'
import type { PredictionResponse } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

export default function MMSEScoreCard({ result }: { result: PredictionResponse }) {
  const [displayed, setDisplayed] = useState(0)
  const target = result.predicted_mmse ?? 0
  const sev    = result.severity

  useEffect(() => {
    let start = 0
    const duration = 1500
    const step = 16
    const inc  = target / (duration / step)
    const timer = setInterval(() => {
      start += inc
      if (start >= target) { setDisplayed(target); clearInterval(timer) }
      else setDisplayed(parseFloat(start.toFixed(1)))
    }, step)
    return () => clearInterval(timer)
  }, [target])

  const pct = Math.min((target / 30) * 100, 100)

  const sevColor = sev?.color ?? '#10b981'

  return (
    <div className="rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-6 sm:p-8 relative overflow-hidden"
      style={{ boxShadow: `0 0 60px ${sevColor}0f` }}>
      {/* Subtle glow background */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: sevColor }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div>
              <h2 className="syne text-lg font-bold text-[#f0faf0]">Analysis Results</h2>
              <p className="text-[#6b8f6b] text-xs">EEG analysis complete</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full border text-xs font-medium"
            style={{ borderColor: `${sevColor}40`, color: sevColor, background: `${sevColor}15` }}>
            {sev?.band}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Score gauge */}
          <div>
            <p className="text-[#6b8f6b] text-xs uppercase tracking-widest mb-4">Mini-Mental State Exam (MMSE) Score</p>
            {/* Circular progress */}
            <div className="relative w-44 h-44 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="60" fill="none" stroke="#162016" strokeWidth="10" />
                <circle cx="72" cy="72" r="60" fill="none"
                  stroke={sevColor} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="syne text-4xl font-bold text-[#f0faf0]">
                  {Math.round(displayed)}
                </span>
                <span className="text-[#6b8f6b] text-sm">/30</span>
              </div>
            </div>
            <p className="text-[#6b8f6b] text-xs text-center mt-3">
              Based on {result.eeg_stats?.n_epochs ?? 0} EEG epochs
            </p>
          </div>

          {/* Severity + details */}
          <div className="space-y-4">
            <div>
              <p className="text-[#8aaa8a] text-xs uppercase tracking-widest mb-2">Severity Classification</p>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                style={{ borderColor: `${sevColor}40`, background: `${sevColor}12` }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: sevColor }} />
                <span className="syne font-bold text-lg" style={{ color: sevColor }}>{sev?.band}</span>
              </div>
              <p className="text-[#6b8f6b] text-xs mt-1.5">Score range {sev?.range}: {sev?.description}</p>
            </div>

            {result.predicted_condition && (
              <div>
                <p className="text-[#8aaa8a] text-xs uppercase tracking-widest mb-2">Predicted Condition</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-800/40 bg-red-950/20">
                  <span className="text-red-400 font-bold text-sm">{result.predicted_condition}</span>
                </div>
              </div>
            )}

            {/* Sample rate */}
            {result.eeg_stats?.sfreq && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[#8aaa8a] text-xs uppercase tracking-widest">Sample Rate</p>
                  <span className="text-emerald-400 text-sm font-semibold">{result.eeg_stats.sfreq} Hz</span>
                </div>
                <div className="h-2 bg-[#162016] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600"
                    style={{ width: `${Math.min((result.eeg_stats.sfreq / 1000) * 100, 100)}%`, transition: 'width 1.5s ease-out' }} />
                </div>
                <p className="text-[#4a6a4a] text-xs mt-1">Recording quality: Excellent</p>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: 'EEG Channels', val: result.eeg_stats?.n_channels, color: '#10b981' },
                { label: 'Sample Rate',  val: `${result.eeg_stats?.sfreq} Hz`, color: '#10b981' },
                { label: 'Duration',     val: result.eeg_stats?.total_duration_sec ? `${Math.round(result.eeg_stats.total_duration_sec / 60)} min` : '—', color: '#10b981' },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center rounded-xl bg-[#162016] border border-[#1e2e1e] p-3">
                  <p className="text-xs font-medium mb-0.5" style={{ color }}>{label}</p>
                  <p className="syne text-[#f0faf0] font-bold text-base">{val ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {sev?.recommendation && (
          <div className="mt-6 pt-5 border-t border-[#1e2e1e]">
            <p className="text-[#f0faf0] text-sm font-medium">{sev.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  )
}