'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, ShieldCheck, Activity } from 'lucide-react'

const FADE = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#070b07] pt-16">
      {/* Hero */}
      <section className="relative py-20 border-b border-[#1e2e1e] grid-bg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div {...FADE(0.1)}>
            <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-3">About</p>
            <h1 className="syne text-4xl sm:text-5xl font-bold mb-3">
              <span className="text-gradient">About NeuroPulse</span>
            </h1>
            <p className="text-[#8aaa8a] text-lg">
              Advancing cognitive assessment through intelligent EEG analysis
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">

        {/* Mission */}
        <motion.div {...FADE(0.1)}
          className="rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-7">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h2 className="syne text-xl font-bold text-[#f0faf0]">Our Mission</h2>
          </div>
          <p className="text-[#8aaa8a] leading-relaxed mb-4">
            NeuroPulse is a cutting-edge platform designed to assist healthcare professionals in cognitive assessment through advanced EEG analysis. Our technology provides rapid, objective MMSE (Mini-Mental State Examination) score predictions and severity band classifications for neurodegenerative diseases.
          </p>
          <p className="text-[#8aaa8a] leading-relaxed">
            By leveraging machine learning models trained on extensive EEG datasets, NeuroPulse delivers high-confidence predictions that support clinical decision-making while maintaining the highest standards of medical accuracy and patient privacy.
          </p>
        </motion.div>

        {/* What is MMSE */}
        <motion.div {...FADE(0.15)}
          className="rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-7">
          <h2 className="syne text-xl font-bold text-[#f0faf0] mb-1">What is MMSE?</h2>
          <p className="text-emerald-500 text-sm mb-4">Mini-Mental State Examination</p>
          <p className="text-[#8aaa8a] leading-relaxed mb-5">
            The Mini-Mental State Examination (MMSE) is a widely recognized cognitive screening tool used to assess mental status. It evaluates memory, attention, language, and visual-spatial skills, providing a total score ranging from 0 to 30.
          </p>
          <div className="rounded-xl border border-[#1e2e1e] bg-[#070b07] p-5">
            <p className="text-[#f0faf0] font-semibold text-sm mb-4">MMSE Score Interpretation:</p>
            <div className="space-y-3">
              {[
                { range: '24–30', label: 'Normal',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',   note: 'No cognitive impairment' },
                { range: '18–23', label: 'Mild',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   note: 'Mild impairment' },
                { range: '10–17', label: 'Moderate', color: '#f97316', bg: 'rgba(249,115,22,0.1)',   note: 'Moderate impairment' },
                { range: '0–9',   label: 'Severe',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    note: 'Severe impairment' },
              ].map(({ range, label, color, bg, note }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#1e2e1e] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ color, background: bg }}>{range}</span>
                    <span className="text-[#f0faf0] text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-[#6b8f6b] text-sm">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Target Conditions */}
        <motion.div {...FADE(0.2)}
          className="rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-7">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h2 className="syne text-xl font-bold text-[#f0faf0]">Target Conditions</h2>
          </div>
          <p className="text-[#6b8f6b] text-sm mb-5">NeuroPulse analyzes patterns associated with these neurodegenerative diseases</p>
          <div className="space-y-4">
            {[
              {
                title: "Alzheimer's Disease (AD)",
                desc: "The most common form of dementia, characterized by progressive memory loss, cognitive decline, and behavioral changes. Early detection through EEG patterns can support timely intervention.",
                color: '#ef4444',
                bg: 'rgba(239,68,68,0.05)',
                border: 'rgba(239,68,68,0.2)',
              },
              {
                title: "Frontotemporal Dementia (FTD)",
                desc: "A group of dementias affecting the frontal and temporal lobes, often presenting with behavioral and language disturbances. Distinct EEG signatures help differentiate FTD from other dementias.",
                color: '#f97316',
                bg: 'rgba(249,115,22,0.05)',
                border: 'rgba(249,115,22,0.2)',
              },
              {
                title: "Healthy Controls",
                desc: "EEG patterns from cognitively healthy individuals serve as the baseline for comparison, ensuring that our model can accurately distinguish normal aging from pathological cognitive decline.",
                color: '#10b981',
                bg: 'rgba(16,185,129,0.05)',
                border: 'rgba(16,185,129,0.2)',
              },
            ].map(({ title, desc, color, bg, border }) => (
              <div key={title} className="rounded-xl p-4 border" style={{ background: bg, borderColor: border }}>
                <p className="font-semibold text-sm mb-1" style={{ color }}>{title}</p>
                <p className="text-[#8aaa8a] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div {...FADE(0.25)}
          className="rounded-2xl border border-emerald-800/30 bg-emerald-950/20 p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="syne text-lg font-bold text-[#f0faf0]">Privacy & Data</h2>
          </div>
          <p className="text-[#8aaa8a] text-sm leading-relaxed">
            NeuroPulse processes your EEG data entirely within the session. No patient data is stored, logged, or transmitted to any external service. After the analysis window is closed, all data is discarded. This system is designed to support clinical professionals and researchers while upholding the highest standards of patient confidentiality.
          </p>
        </motion.div>
      </div>
    </main>
  )
}