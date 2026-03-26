'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle2, XCircle, Loader2,
  Brain, Zap, FileText, Activity, X, Eye, Download,
} from 'lucide-react'
import { toast } from 'sonner'
import type { PredictionResponse, AnalysisState } from '@/lib/types'

import MMSEScoreCard         from '@/components/results/MMSEScoreCard'
import BandPowerCard         from '@/components/results/BandPowerCard'
import XAIInterpretationCard from '@/components/results/XAIInterpretationCard'
import EpochTimelineCard     from '@/components/results/EpochTimelineCard'
import SHAPFeatureCard       from '@/components/results/SHAPFeatureCard'
import ElectrodeCard         from '@/components/results/ElectrodeCard'
import EEGStatsCard          from '@/components/results/EEGStatsCard'
import SeverityReferenceCard from '@/components/results/SeverityReferenceCard'
import SkeletonResults       from '@/components/results/SkeletonResults'

const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function AnalyzePage() {
  const [state,    setState]    = useState<AnalysisState>('IDLE')
  const [file,     setFile]     = useState<File | null>(null)
  const [valMsg,   setValMsg]   = useState('')
  const [result,   setResult]   = useState<PredictionResponse | null>(null)
  const inputRef                = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState<'view' | 'download' | null>(null)

  const reset = useCallback(() => {
    setState('IDLE'); setFile(null); setValMsg(''); setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const validate = useCallback(async (f: File) => {
    setFile(f); setState('VALIDATING'); setValMsg('')
    if (!f.name.toLowerCase().endsWith('.set')) {
      setState('INVALID'); setValMsg('Only .set (EEGLAB) files are accepted.')
      toast.error('Invalid file format', { description: 'Only .set files are accepted.' })
      return
    }
    try {
      const fd = new FormData(); fd.append('file', f)
      const res  = await fetch('/api/validate', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.valid) {
        setState('VALID'); setValMsg('Valid EEG file — ready to analyse')
        toast.success('File validated successfully', { description: 'Click Analyze EEG to begin processing.' })
      } else {
        setState('INVALID'); setValMsg(data.message || 'Validation failed')
        toast.error('Validation failed', { description: data.message })
      }
    } catch {
      setState('INVALID'); setValMsg('Could not reach validation service.')
      toast.error('Validation error', { description: 'Could not connect to the validation service.' })
    }
  }, [])

  const analyze = useCallback(async () => {
    if (!file || state !== 'VALID') return
    setState('ANALYZING')
    const tid = toast.loading('Analysing EEG signal…', { description: 'This may take 30–90 seconds. Please wait.' })
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/predict', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || data.detail || 'Analysis failed')
      setResult(data); setState('RESULTS')
      toast.dismiss(tid)
      toast.success('Analysis complete!', { description: `Predicted MMSE Score: ${data.predicted_mmse}/30` })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      setState('VALID'); toast.dismiss(tid)
      toast.error('Analysis failed', { description: msg })
    }
  }, [file, state])

  // Fixed: View Report - opens in new tab as HTML
  const viewReport = useCallback(async () => {
    if (!result) return
    setIsGenerating('view')
    const tid = toast.loading('Preparing report...')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      
      if (!res.ok) throw new Error('Failed to generate report')
      
      const html = await res.text()
      
      // Open in new tab
      const reportWindow = window.open()
      if (reportWindow) {
        reportWindow.document.write(html)
        reportWindow.document.close()
        reportWindow.document.title = 'NeuroPulse Analysis Report'
        toast.dismiss(tid)
        toast.success('Report opened in new tab')
      } else {
        // Fallback: create blob and open
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        URL.revokeObjectURL(url)
        toast.dismiss(tid)
        toast.success('Report opened in new tab')
      }
    } catch (err) {
      toast.dismiss(tid)
      toast.error('Failed to generate report', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsGenerating(null)
    }
  }, [result])

  // Fixed: Download Report - saves as HTML file
  const downloadReport = useCallback(async () => {
    if (!result) return
    setIsGenerating('download')
    const tid = toast.loading('Generating report for download...')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      
      if (!res.ok) throw new Error('Failed to generate report')
      
      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NeuroPulse_Report_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.dismiss(tid)
      toast.success('Report downloaded successfully!', { 
        description: 'Open the HTML file in any browser and use Ctrl+P to save as PDF.' 
      })
    } catch (err) {
      toast.dismiss(tid)
      toast.error('Failed to download report', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsGenerating(null)
    }
  }, [result])

  // ── Results view ──────────────────────────────────────────────
  if (state === 'RESULTS' && result) {
    return (
      <main className="min-h-screen bg-[#070b07] pt-20 px-4 py-8 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium uppercase tracking-widest">Analysis Complete</span>
              </div>
              <h1 className="syne text-2xl font-bold text-[#f0faf0]">Analysis Results</h1>
              <p className="text-[#6b8f6b] text-sm mt-0.5">{result.eeg_stats?.filename}</p>
            </div>
            <button onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1e2e1e] text-[#8aaa8a] hover:text-[#f0faf0] hover:bg-[#0f150f] transition-all text-sm">
              ← New Analysis
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div className="lg:col-span-3" custom={0} variants={FADE_UP} initial="hidden" animate="show">
              <MMSEScoreCard result={result} />
            </motion.div>
            <motion.div className="lg:col-span-2" custom={1} variants={FADE_UP} initial="hidden" animate="show">
              <BandPowerCard result={result} />
            </motion.div>
            <motion.div className="lg:col-span-1" custom={2} variants={FADE_UP} initial="hidden" animate="show">
              <XAIInterpretationCard result={result} />
            </motion.div>
            <motion.div className="lg:col-span-3" custom={3} variants={FADE_UP} initial="hidden" animate="show">
              <EpochTimelineCard result={result} />
            </motion.div>
            <motion.div className="lg:col-span-2" custom={4} variants={FADE_UP} initial="hidden" animate="show">
              <SHAPFeatureCard result={result} />
            </motion.div>
            <motion.div className="lg:col-span-1" custom={5} variants={FADE_UP} initial="hidden" animate="show">
              <ElectrodeCard result={result} />
            </motion.div>
            <motion.div className="lg:col-span-2" custom={6} variants={FADE_UP} initial="hidden" animate="show">
              <EEGStatsCard result={result} />
            </motion.div>
            <motion.div className="lg:col-span-1" custom={7} variants={FADE_UP} initial="hidden" animate="show">
              <SeverityReferenceCard result={result} />
            </motion.div>
            
            {/* Report buttons - FIXED */}
            <motion.div className="lg:col-span-3 flex justify-center gap-4 pt-4" custom={8} variants={FADE_UP} initial="hidden" animate="show">
              <button 
                onClick={viewReport}
                disabled={isGenerating !== null}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 hover:scale-[1.02] transition-all shadow-xl shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating === 'view' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                View Report
              </button>
              
              <button 
                onClick={downloadReport}
                disabled={isGenerating !== null}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base border-2 border-emerald-600/50 bg-transparent text-emerald-400 hover:bg-emerald-950/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating === 'download' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                Download Report (HTML)
              </button>
            </motion.div>
            
            <motion.div className="lg:col-span-3 text-center pt-2" custom={9} variants={FADE_UP} initial="hidden" animate="show">
            <p className="text-[#4a6a4a] text-xs">
                💡 To save as PDF: View report, then press <kbd className="px-1 py-0.5 bg-[#162016] rounded text-[#8aaa8a]">Ctrl+P</kbd> (or <kbd className="px-1 py-0.5 bg-[#162016] rounded text-[#8aaa8a]">Cmd+P</kbd>) and select &quot;Save as PDF&quot;
            </p>
            </motion.div>
          </div>
        </div>
      </main>
    )
  }

  // ── Analyzing skeleton ────────────────────────────────────────
  if (state === 'ANALYZING') {
    return (
      <main className="min-h-screen bg-[#070b07] pt-20 px-4 py-8 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-1 bg-[#162016] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{ width: '50%' }}
              />
            </div>
            <p className="text-[#8aaa8a] text-sm mt-3 text-center">
              Analysing EEG signal — please wait 30–90 seconds…
            </p>
          </div>
          <SkeletonResults />
        </div>
      </main>
    )
  }

  // ── Upload view ───────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#070b07] pt-16">
      {/* Hero header */}
      <div className="relative py-16 text-center border-b border-[#1e2e1e] grid-bg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-900/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-3">EEG Analysis</p>
            <h1 className="syne text-4xl sm:text-5xl font-bold mb-3">
              <span className="text-[#f0faf0]">Start Your </span>
              <span className="text-gradient">Analysis</span>
            </h1>
            <p className="text-[#8aaa8a] text-lg">
              Upload your EEG file to receive instant MMSE score prediction and severity classification
            </p>
          </motion.div>
        </div>
      </div>

      {/* Upload section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {/* Upload card */}
          <div className="rounded-2xl border border-[#1e2e1e] bg-[#0f150f] p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="syne text-lg font-bold text-[#f0faf0]">Upload EEG File</h2>
                <p className="text-[#6b8f6b] text-sm">Supported formats: .set</p>
              </div>
              {file && (
                <button onClick={reset}
                  className="w-8 h-8 rounded-lg border border-[#1e2e1e] flex items-center justify-center text-[#6b8f6b] hover:text-[#f0faf0] hover:bg-[#162016] transition-all">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) validate(f) }}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
                dragging            ? 'border-emerald-500 bg-emerald-950/20 scale-[1.01]' : ''
              } ${state === 'VALID'   ? 'border-emerald-600/60 bg-emerald-950/10' : ''
              } ${state === 'INVALID' ? 'border-red-500/60 bg-red-950/10' : ''
              } ${(state === 'IDLE' || state === 'VALIDATING') ? 'border-[#253525] bg-[#162016]/50 hover:border-emerald-700/50 hover:bg-emerald-950/10' : ''}`}
            >
              <input ref={inputRef} type="file" accept=".set" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) validate(f) }} />

              <div className="flex justify-center mb-4">
                {state === 'VALIDATING' && <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />}
                {state === 'VALID'      && <CheckCircle2 className="w-12 h-12 text-emerald-400" />}
                {state === 'INVALID'    && <XCircle className="w-12 h-12 text-red-400" />}
                {state === 'IDLE'       && (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-emerald-400" />
                  </div>
                )}
              </div>

              {state === 'IDLE' && (
                <>
                  <p className="text-[#f0faf0] font-semibold text-base mb-1">Drop your EEG file here</p>
                  <p className="text-[#6b8f6b] text-sm">or click to browse</p>
                  <p className="text-[#4a6a4a] text-xs mt-2">Supported formats: .set · Max 50 MB</p>
                </>
              )}
              {state === 'VALIDATING' && (
                <p className="text-[#8aaa8a]">Validating <span className="text-[#f0faf0] font-mono">{file?.name}</span>…</p>
              )}
              {state === 'VALID' && (
                <p className="text-emerald-400 text-sm font-medium">{valMsg}</p>
              )}
              {state === 'INVALID' && (
                <p className="text-red-400 text-sm">{valMsg}</p>
              )}
            </div>

            {/* Selected file info */}
            {file && (
              <div className={`mt-4 px-4 py-3 rounded-xl border flex items-center gap-3 ${
                state === 'VALID'   ? 'border-emerald-700/40 bg-emerald-950/20' :
                state === 'INVALID' ? 'border-red-700/40 bg-red-950/10' :
                'border-[#1e2e1e] bg-[#162016]'
              }`}>
                <FileText className={`w-4 h-4 shrink-0 ${state === 'VALID' ? 'text-emerald-400' : state === 'INVALID' ? 'text-red-400' : 'text-[#6b8f6b]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#f0faf0] text-sm font-medium truncate">{file.name}</p>
                  <p className="text-[#6b8f6b] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {state === 'VALID' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {state === 'INVALID' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={analyze}
            disabled={state !== 'VALID'}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-600 to-teal-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.01] transition-all shadow-xl shadow-emerald-900/30"
          >
            <Activity className="w-5 h-5" />
            Analyze EEG
          </button>

          {/* Feature pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { icon: Brain,    label: 'CNN+GRU Model' },
              { icon: Zap,      label: 'XAI Explanations' },
              { icon: Activity, label: 'MMSE Scoring' },
              { icon: Eye,      label: 'HTML Report' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl border border-[#1e2e1e] bg-[#0f150f] p-3 flex items-center gap-2">
                <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[#8aaa8a] text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}