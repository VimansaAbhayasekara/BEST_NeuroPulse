'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'What file types are supported?',
    a: 'NeuroPulse currently supports EEGLAB .set format files only. This is the standard format used by EEGLAB and is widely compatible with research-grade EEG recording systems. Files must be under 50 MB.',
  },
  {
    q: 'Is this a medical diagnosis?',
    a: 'No. NeuroPulse provides predictive support for clinical assessment only. The MMSE score prediction and severity band classification are intended to assist healthcare professionals in their diagnostic process, not to replace clinical judgment or comprehensive neuropsychological evaluation. Always consult with qualified healthcare professionals for diagnosis.',
  },
  {
    q: 'How is the severity band computed?',
    a: 'The severity band is derived directly from the predicted MMSE score using standard clinical thresholds: Normal (24–30), Mild (18–23), Moderate (10–17), and Severe (0–9). The MMSE score itself is predicted by our CNN+GRU deep learning model trained on labeled EEG datasets.',
  },
  {
    q: 'What is the confidence score?',
    a: 'The confidence score reflects the model\'s certainty in its prediction, derived from the variance of MMSE predictions across multiple EEG epochs. A low variance across epochs indicates higher confidence in the median predicted score.',
  },
  {
    q: 'How long does analysis take?',
    a: 'Analysis typically takes between 30 and 90 seconds depending on the file size, number of channels, and server load. The progress indicator will keep you informed during processing.',
  },
  {
    q: 'What are the system requirements?',
    a: 'NeuroPulse runs entirely in the browser. You need a modern web browser (Chrome, Firefox, Edge, or Safari) and a stable internet connection. No software installation is required.',
  },
  {
    q: 'What EEG features does the model use?',
    a: 'The model extracts frequency band powers (Delta, Theta, Alpha, Beta, Gamma), spectral ratios (Theta/Alpha, Delta/Alpha, Slowing Index), and spatial features across all electrode channels. SHAP values reveal which features contributed most to each prediction.',
  },
  {
    q: 'Is my data stored or transmitted?',
    a: 'No. Your EEG file is processed in-session only. No patient data is stored on our servers, logged, or transmitted to any third party. All data is discarded when you close or reset the session.',
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="border-b border-[#1e2e1e] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className={`text-sm font-semibold pr-4 transition-colors ${open ? 'text-emerald-400' : 'text-[#f0faf0] group-hover:text-emerald-300'}`}>
          {q}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-all duration-200 ${open ? 'rotate-180 text-emerald-400' : 'text-[#6b8f6b]'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-[#8aaa8a] text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#070b07] pt-16">
      {/* Hero */}
      <section className="relative py-20 border-b border-[#1e2e1e] grid-bg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/3 w-80 h-64 bg-teal-900/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-3">Support</p>
            <h1 className="syne text-4xl sm:text-5xl font-bold text-gradient mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-[#8aaa8a] text-lg">
              Find answers to common questions about NeuroPulse
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-2xl border border-[#1e2e1e] bg-[#0f150f] px-6 py-2"
        >
          <div className="flex items-center gap-2 py-5 border-b border-[#1e2e1e]">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="syne text-[#f0faf0] font-bold text-base">Questions & Answers</p>
              <p className="text-[#6b8f6b] text-xs">Everything you need to know about using NeuroPulse</p>
            </div>
          </div>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-5 text-center"
        >
          <p className="text-[#8aaa8a] text-sm">
            Still have questions?{' '}
            <a href="mailto:support@neuropulse.ai" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Contact the team
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  )
}