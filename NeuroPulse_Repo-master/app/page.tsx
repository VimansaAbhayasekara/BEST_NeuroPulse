'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Upload, Brain, Activity, FileText,
  Zap, ChevronRight, ArrowRight,
  Cpu, ShieldCheck, TrendingUp,
} from 'lucide-react'

const FADE = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b07] overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 grid-bg">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-900/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text */}
            <div>
              <motion.div {...FADE(0.1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-950/40 text-emerald-400 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Advanced Clinical Analysis
              </motion.div>

              <motion.h1 {...FADE(0.15)} className="syne text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-[#f0faf0]">Intelligent</span>{' '}
                <br />
                <span className="text-gradient">Cognitive</span>
                <br />
                <span className="text-gradient">Assessment</span>
              </motion.h1>

              <motion.p {...FADE(0.2)} className="text-[#8aaa8a] text-lg leading-relaxed mb-8 max-w-lg">
                Advanced EEG analysis powered by machine learning for early detection and severity classification of neurodegenerative diseases — AD, FTD, and healthy controls.
              </motion.p>

              <motion.div {...FADE(0.25)} className="flex flex-wrap gap-3">
                <Link href="/analyze"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-200 shadow-xl shadow-emerald-900/40 hover:shadow-emerald-800/50 hover:scale-[1.02]">
                  <Activity className="w-4 h-4" />
                  Analyze EEG Data
                </Link>
                <Link href="/about"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-[#253525] bg-[#0f150f] hover:bg-[#162016] text-[#f0faf0] font-semibold transition-all duration-200">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div {...FADE(0.3)} className="flex gap-6 mt-10 pt-8 border-t border-[#1e2e1e]">
                {[
                  { val: 'CNN+GRU', label: 'Model Architecture' },
                  { val: 'SHAP', label: 'XAI Explanation' },
                  { val: '0–30', label: 'MMSE Range' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="syne text-xl font-bold text-emerald-400">{val}</p>
                    <p className="text-[#6b8f6b] text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Brain SVG illustration */}
              <div className="relative rounded-3xl overflow-hidden border border-[#1e2e1e] bg-gradient-to-br from-[#0f150f] to-[#162016] aspect-[4/3] flex items-center justify-center shadow-2xl shadow-black/50">
                {/* Decorative circuit lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300">
                  <path d="M50,150 Q100,80 200,100 Q300,120 350,80" stroke="#10b981" fill="none" strokeWidth="1" strokeDasharray="4,4" />
                  <path d="M50,170 Q150,220 200,200 Q250,180 350,220" stroke="#0d9488" fill="none" strokeWidth="1" strokeDasharray="4,4" />
                  <path d="M100,50 L100,250" stroke="#10b981" fill="none" strokeWidth="0.5" opacity="0.5" />
                  <path d="M200,50 L200,250" stroke="#10b981" fill="none" strokeWidth="0.5" opacity="0.5" />
                  <path d="M300,50 L300,250" stroke="#10b981" fill="none" strokeWidth="0.5" opacity="0.5" />
                  {[60,80,100,120,140,160,180,200,220,240,260,280].map((y, i) => (
                    <path key={i} d={`M0,${y} Q${50+i*10},${y-20} ${100+i*5},${y+10} Q${150+i*5},${y+20} ${200+i*5},${y-10} Q${250+i*5},${y-20} ${400},${y+5}`}
                      stroke={i % 3 === 0 ? '#10b981' : '#0d9488'} fill="none" strokeWidth="0.5" opacity="0.3" />
                  ))}
                  <circle cx="200" cy="150" r="60" stroke="#10b981" fill="none" strokeWidth="1" opacity="0.3" />
                  <circle cx="200" cy="150" r="40" stroke="#10b981" fill="rgba(16,185,129,0.05)" strokeWidth="0.5" />
                </svg>

                {/* Center brain icon */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="animate-float">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-900/60 to-teal-900/60 border border-emerald-700/30 flex items-center justify-center shadow-xl shadow-emerald-900/40">
                      <Brain className="w-12 h-12 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['Delta','Theta','Alpha','Beta'].map((band, i) => (
                      <div key={band} className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-medium">
                        {band}
                      </div>
                    ))}
                  </div>
                  {/* Mock waveform */}
                  <svg width="240" height="40" viewBox="0 0 240 40">
                    <polyline
                      points="0,20 10,5 20,30 30,10 40,25 50,8 60,32 70,12 80,22 90,6 100,28 110,14 120,20 130,4 140,30 150,10 160,24 170,8 180,28 190,15 200,22 210,7 220,30 230,14 240,20"
                      fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Corner badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-[#070b07]/80 border border-[#1e2e1e] text-emerald-400 text-xs font-medium">
                    MMSE Prediction
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[#070b07]/80 border border-[#1e2e1e] text-teal-400 text-xs font-medium">
                    XAI Enabled
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...FADE(0)} className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-medium mb-3 tracking-widest uppercase">Process</p>
            <h2 className="syne text-4xl font-bold text-[#f0faf0]">How It Works</h2>
            <p className="text-[#8aaa8a] text-lg mt-3 max-w-xl mx-auto">Three simple steps to get clinical-grade EEG cognitive assessment results</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload EEG File',
                desc: 'Upload your EEGLAB .set formatted file. We validate the format and structure before processing.',
                color: 'emerald',
              },
              {
                step: '02',
                icon: Cpu,
                title: 'AI Analysis',
                desc: 'Our CNN+GRU model processes your EEG data, extracting brainwave features and temporal patterns.',
                color: 'teal',
              },
              {
                step: '03',
                icon: FileText,
                title: 'MMSE Score + Report',
                desc: 'Receive a predicted MMSE score, severity band, XAI interpretation, and a downloadable PDF report.',
                color: 'emerald',
              },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div key={step} {...FADE(i * 0.1)}
                className="relative rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-6 hover:border-emerald-800/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    color === 'emerald' ? 'bg-emerald-950/80 border border-emerald-800/40' : 'bg-teal-950/80 border border-teal-800/40'
                  }`}>
                    <Icon className={`w-5 h-5 ${color === 'emerald' ? 'text-emerald-400' : 'text-teal-400'}`} />
                  </div>
                  <span className="syne text-4xl font-bold text-[#1e2e1e] group-hover:text-[#253525] transition-colors">{step}</span>
                </div>
                <h3 className="syne text-lg font-bold text-[#f0faf0] mb-2">{title}</h3>
                <p className="text-[#8aaa8a] text-sm leading-relaxed">{desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                    <ChevronRight className="w-5 h-5 text-[#253525]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What NeuroPulse predicts ──────────────────────────────── */}
      <section className="py-24 border-t border-[#1e2e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...FADE(0)} className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-medium mb-3 tracking-widest uppercase">Capabilities</p>
            <h2 className="syne text-4xl font-bold text-[#f0faf0]">What NeuroPulse Predicts</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Activity,
                title: 'Continuous MMSE Score',
                desc: 'A precise score from 0 to 30 representing the predicted Mini-Mental State Examination result based on EEG patterns.',
                badge: '0 – 30',
              },
              {
                icon: TrendingUp,
                title: 'Severity Band',
                desc: 'Classification into Normal, Mild, Moderate, or Severe cognitive impairment categories based on the predicted MMSE.',
                badge: '4 Bands',
              },
              {
                icon: Zap,
                title: 'XAI Interpretation',
                desc: 'SHAP-based explainable AI reveals which EEG features and electrodes drove the prediction for clinical transparency.',
                badge: 'SHAP',
              },
            ].map(({ icon: Icon, title, desc, badge }) => (
              <motion.div key={title} {...FADE(0)}
                className="rounded-2xl border border-[#1e2e1e] bg-gradient-to-b from-[#0f150f] to-[#070b07] p-6 hover:border-emerald-800/40 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 text-xs font-medium border border-emerald-800/30">{badge}</span>
                </div>
                <h3 className="syne text-base font-bold text-[#f0faf0] mb-2">{title}</h3>
                <p className="text-[#6b8f6b] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it matters ────────────────────────────────────────── */}
      <section className="py-24 border-t border-[#1e2e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-3 tracking-widest uppercase">Impact</p>
              <h2 className="syne text-4xl font-bold text-[#f0faf0] mb-6">Why It Matters</h2>
              <div className="space-y-4">
                {[
                  { title: 'Early Screening Support', desc: 'EEG-based screening can identify early cognitive decline patterns before clinical symptoms become apparent.' },
                  { title: 'Objective Measurement', desc: 'Removes subjectivity from cognitive assessment with data-driven, reproducible analysis.' },
                  { title: 'Explainable Results', desc: 'SHAP values and electrode contribution maps provide transparent, interpretable clinical insights.' },
                  { title: 'No Data Stored', desc: 'Analysis happens in-session only. No patient data is stored, transmitted, or retained after the session.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-3 p-4 rounded-xl border border-[#1e2e1e] bg-[#0f150f]">
                    <div className="w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-[#f0faf0] font-semibold text-sm mb-0.5">{title}</p>
                      <p className="text-[#6b8f6b] text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-[#1e2e1e] bg-gradient-to-br from-[#0f150f] to-[#162016] p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mx-auto mb-5 animate-float">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="syne text-xl font-bold text-[#f0faf0] mb-2">Research Support Tool</h3>
                <p className="text-[#8aaa8a] text-sm leading-relaxed">
                  NeuroPulse is designed to assist healthcare professionals and researchers — not replace clinical judgment.
                </p>
                <div className="mt-6 pt-5 border-t border-[#1e2e1e]">
                  <Link href="/analyze"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-900/30">
                    Start Analysis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}