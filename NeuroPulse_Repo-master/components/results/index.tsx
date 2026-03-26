'use client'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine, Cell,
} from 'recharts'
import type { PredictionResponse } from '@/lib/types'

// ── Shared card wrapper ──────────────────────────────────────────────────────
function Card({ title, desc, children, className = '' }: {
  title: string; desc?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-5 h-full ${className}`}>
      <h3 className="syne text-[#f0faf0] font-bold text-base mb-1">{title}</h3>
      {desc && <p className="text-[#6b8f6b] text-xs mb-4">{desc}</p>}
      {children}
    </div>
  )
}

const TIP = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#070b07] border border-[#253525] rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-[#f0faf0] font-semibold">{payload[0].payload?.name ?? payload[0].name}</p>
      <p className="text-emerald-400">{Number(payload[0].value).toFixed(4)}</p>
    </div>
  )
}

// ── Band Power Card ──────────────────────────────────────────────────────────
export function BandPowerCard({ result }: { result: PredictionResponse }) {
  const bp = result.band_powers ?? {}
  const sr = result.spectral_ratios ?? {}

  const radarData = [
    { name: 'Delta', value: bp.delta ?? 0 },
    { name: 'Theta', value: bp.theta ?? 0 },
    { name: 'Alpha', value: bp.alpha ?? 0 },
    { name: 'Beta',  value: bp.beta  ?? 0 },
    { name: 'Gamma', value: bp.gamma ?? 0 },
  ]

  const ratioData = [
    { name: 'θ/α Ratio',     value: sr.theta_alpha_ratio ?? 0 },
    { name: 'δ/α Ratio',     value: sr.delta_alpha_ratio ?? 0 },
    { name: 'Slowing Index', value: sr.slowing_index     ?? 0 },
  ]

  return (
    <Card title="Brainwave Analysis" desc="EEG frequency band powers and clinical spectral ratios">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[#6b8f6b] text-xs mb-2 font-medium">Band Powers</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2e1e" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#6b8f6b', fontSize: 11, fontFamily: 'Inter' }} />
              <Radar dataKey="value" fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-[#6b8f6b] text-xs mb-2 font-medium">Spectral Ratios</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratioData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2e1e" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b8f6b', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b8f6b', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TIP />} />
              <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

// ── XAI Interpretation Card ──────────────────────────────────────────────────
export function XAIInterpretationCard({ result }: { result: PredictionResponse }) {
  const xai = result.xai_text ?? {}
  return (
    <Card title="Clinical Interpretation" desc="AI explanation of prediction drivers">
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide mb-2">Top EEG Drivers</p>
          {(xai.feature_sentences ?? []).map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
              <p className="text-[#8aaa8a] text-xs leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-emerald-950/20 border border-emerald-800/20 p-3">
          <p className="text-xs text-[#8aaa8a] leading-relaxed">{xai.clinical_summary}</p>
        </div>
        {xai.top_channel && (
          <p className="text-[#6b8f6b] text-xs">
            Most active region:{' '}
            <span className="text-teal-400 font-medium">Electrode {xai.top_channel}</span>
          </p>
        )}
        {xai.recommendation && (
          <div className="rounded-lg bg-amber-950/20 border border-amber-800/30 p-3">
            <p className="text-amber-400 text-xs font-semibold mb-1">Recommendation</p>
            <p className="text-amber-300/80 text-xs leading-relaxed">{xai.recommendation}</p>
          </div>
        )}
        {xai.disclaimer && (
          <div className="rounded-lg bg-[#162016]/50 border border-[#1e2e1e] p-2">
            <p className="text-[#6b8f6b] text-[10px] leading-relaxed">{xai.disclaimer}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Epoch Timeline Card ──────────────────────────────────────────────────────
export function EpochTimelineCard({ result }: { result: PredictionResponse }) {
  const epochs = result.mmse_per_epoch ?? []
  const median = result.predicted_mmse ?? 0
  const data   = epochs.map((v, i) => ({ epoch: i + 1, mmse: v }))
  const min    = Math.min(...epochs).toFixed(1)
  const max    = Math.max(...epochs).toFixed(1)

  return (
    <Card title="Prediction Stability" desc="MMSE score predicted for each 2-second EEG epoch">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2e1e" vertical={false} />
          <XAxis dataKey="epoch" tick={{ fill: '#6b8f6b', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: 'Epoch', position: 'insideBottom', offset: -2, fill: '#6b8f6b', fontSize: 10 }} />
          <YAxis domain={[0, 30]} tick={{ fill: '#6b8f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<TIP />} />
          <ReferenceLine y={median} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5}
            label={{ value: `Median: ${median}`, position: 'right', fill: '#ef4444', fontSize: 10 }} />
          <Line type="monotone" dataKey="mmse" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-3 mt-4">
        {[['Min', min], ['Median', median.toFixed(1)], ['Max', max]].map(([label, val]) => (
          <div key={label as string}
            className="flex-1 rounded-xl bg-[#162016] border border-[#1e2e1e] px-3 py-2.5 text-center">
            <p className="text-[#6b8f6b] text-xs">{label}</p>
            <p className="syne text-[#f0faf0] font-bold text-sm mt-0.5">{val}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── SHAP Feature Card ────────────────────────────────────────────────────────
export function SHAPFeatureCard({ result }: { result: PredictionResponse }) {
  const feats = (result.feature_importance ?? []).slice(0, 8).map(f => ({
    name: f.feature.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    value: f.shap_value,
    color: f.direction === 'increases MMSE' ? '#10b981' : '#ef4444',
    direction: f.direction,
  }))

  return (
    <Card title="XAI Feature Importance" desc="SHAP values — which EEG features drive the prediction">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={feats} layout="vertical" margin={{ left: 8, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2e1e" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b8f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#6b8f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-[#070b07] border border-[#253525] rounded-xl px-3 py-2 text-xs shadow-xl">
                <p className="text-[#f0faf0] font-semibold">{d.name}</p>
                <p style={{ color: d.color }}>SHAP: {Number(d.value).toFixed(5)}</p>
                <p className="text-[#6b8f6b]">{d.direction}</p>
              </div>
            )
          }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {feats.map((f, i) => <Cell key={i} fill={f.color} fillOpacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-5 mt-3 text-xs text-[#6b8f6b]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block opacity-80" />
          Increases score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block opacity-80" />
          Decreases score
        </span>
      </div>
    </Card>
  )
}

// ── Electrode Card ───────────────────────────────────────────────────────────
export function ElectrodeCard({ result }: { result: PredictionResponse }) {
  const chans = (result.channel_importance ?? []).slice(0, 10)
  const maxV  = Math.max(...chans.map(c => c.shap_value), 0.0001)

  return (
    <Card title="Electrode Contribution" desc="Which brain regions influenced the prediction">
      <div className="space-y-2.5">
        {chans.map((c, i) => (
          <div key={c.channel} className="flex items-center gap-3">
            <span className="w-5 text-[#4a6a4a] text-xs text-right shrink-0">{i + 1}</span>
            <span className="w-10 text-[#f0faf0] text-xs font-mono shrink-0">{c.channel}</span>
            <div className="flex-1 h-1.5 bg-[#162016] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600"
                style={{ width: `${(c.shap_value / maxV) * 100}%`, transition: 'width 1s ease-out' }} />
            </div>
            <span className="w-16 text-emerald-400 text-xs font-mono text-right shrink-0">
              {c.shap_value.toFixed(5)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── EEG Stats Card ───────────────────────────────────────────────────────────
export function EEGStatsCard({ result }: { result: PredictionResponse }) {
  const s = result.eeg_stats ?? {}
  const stats = [
    { label: 'Channels',      value: s.n_channels,         unit: '' },
    { label: 'Epochs',        value: s.n_epochs,           unit: '' },
    { label: 'Sampling Rate', value: s.sfreq,              unit: ' Hz' },
    { label: 'Duration',      value: s.total_duration_sec, unit: 's' },
  ]
  return (
    <Card title="Recording Details" desc="Technical information about the uploaded EEG file">
      <p className="text-teal-400 text-xs font-mono mb-4 truncate">{s.filename}</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, unit }) => (
          <div key={label}
            className="rounded-xl bg-[#162016] border border-[#1e2e1e] p-4 text-center">
            <p className="syne text-[#f0faf0] text-2xl font-bold">{value}{unit}</p>
            <p className="text-[#6b8f6b] text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Severity Reference Card ──────────────────────────────────────────────────
export function SeverityReferenceCard({ result }: { result: PredictionResponse }) {
  const current = result.severity?.band
  const bands = [
    { band: 'Normal',   range: '24–30', color: '#10b981', desc: 'No significant impairment' },
    { band: 'Mild',     range: '18–23', color: '#f59e0b', desc: 'Mild cognitive impairment' },
    { band: 'Moderate', range: '10–17', color: '#f97316', desc: 'Moderate dementia patterns' },
    { band: 'Severe',   range: '0–9',   color: '#ef4444', desc: 'Severe impairment' },
  ]
  return (
    <Card title="Severity Scale Reference">
      <div className="space-y-2.5">
        {bands.map(b => (
          <div key={b.band}
            className={`rounded-xl p-3 border transition-all ${current === b.band ? '' : 'border-[#1e2e1e] bg-[#162016]/40'}`}
            style={current === b.band ? {
              borderColor: `${b.color}40`,
              background: `${b.color}0f`,
              borderLeftWidth: 3,
              borderLeftColor: b.color,
            } : {}}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.color }} />
              <span className="text-sm font-medium" style={{ color: current === b.band ? b.color : '#f0faf0' }}>{b.band}</span>
              <span className="text-[#6b8f6b] text-xs ml-auto font-mono">{b.range}</span>
            </div>
            <p className="text-[#6b8f6b] text-xs mt-1 ml-4 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-[#4a6a4a] text-xs mt-4 text-center">MMSE: 0 (severe) → 30 (normal)</p>
    </Card>
  )
}

// ── Skeleton Results ─────────────────────────────────────────────────────────
export function SkeletonResults() {
  const Sk = ({ h = 'h-8', w = 'w-full', className = '' }: { h?: string; w?: string; className?: string }) => (
    <div className={`${h} ${w} ${className} rounded-lg bg-[#162016] animate-pulse`} />
  )
  const CardSk = ({ h = 'h-48', className = '' }: { h?: string; className?: string }) => (
    <div className={`rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-5 ${h} ${className}`}>
      <Sk h="h-4" w="w-32" className="mb-3" />
      <Sk h="h-3" w="w-48" className="mb-6" />
      <Sk h="h-32" />
    </div>
  )
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <CardSk h="h-56" className="lg:col-span-3" />
      <CardSk h="h-64" className="lg:col-span-2" />
      <CardSk h="h-64" className="lg:col-span-1" />
      <CardSk h="h-56" className="lg:col-span-3" />
      <CardSk h="h-64" className="lg:col-span-2" />
      <CardSk h="h-64" className="lg:col-span-1" />
      <CardSk h="h-48" className="lg:col-span-2" />
      <CardSk h="h-48" className="lg:col-span-1" />
    </div>
  )
}

export default BandPowerCard