// app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { PredictionResponse } from '@/lib/types'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as PredictionResponse

    const sevColor =
      data.severity?.band === 'Normal'   ? '#10b981' :
      data.severity?.band === 'Mild'     ? '#f59e0b' :
      data.severity?.band === 'Moderate' ? '#f97316' : '#ef4444'

    const top5 = (data.feature_importance ?? []).slice(0, 5)

    const featRows = top5.map((f, i) => `
      <tr style="border-bottom:1px solid #1a2e1a;">
        <td style="padding:8px 12px;color:#6b8f6b;font-size:12px;">${i + 1}</td>
        <td style="padding:8px 12px;color:#f0faf0;font-size:12px;font-family:monospace;">${f.feature.replace(/_/g, ' ')}</td>
        <td style="padding:8px 12px;color:#10b981;font-size:12px;font-family:monospace;">${f.shap_value.toFixed(6)}</td>
        <td style="padding:8px 12px;font-size:12px;color:${f.direction === 'increases MMSE' ? '#10b981' : '#ef4444'};">${f.direction}</td>
      </tr>`).join('')

    const featureSentences = (data.xai_text?.feature_sentences ?? []).map((s, i) => `
      <div style="display:flex;gap:10px;margin-bottom:8px;">
        <span style="min-width:20px;height:20px;border-radius:50%;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#10b981;font-size:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:bold;">${i + 1}</span>
        <p style="margin:0;color:#8aaa8a;font-size:12px;line-height:1.6;">${s}</p>
      </div>`).join('')

    const topChannels = (data.channel_importance ?? []).slice(0, 8)
    const maxShap = Math.max(...topChannels.map(c => c.shap_value), 0.0001)

    const channelBars = topChannels.map(c => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;">
        <span style="width:42px;color:#f0faf0;font-family:monospace;font-size:11px;">${c.channel}</span>
        <div style="flex:1;height:6px;background:#162016;border-radius:99px;overflow:hidden;">
          <div style="height:100%;width:${(c.shap_value / maxShap) * 100}%;background:linear-gradient(to right,#10b981,#0d9488);border-radius:99px;"></div>
        </div>
        <span style="width:64px;text-align:right;color:#10b981;font-family:monospace;font-size:10px;">${c.shap_value.toFixed(5)}</span>
      </div>`).join('')

    const bandPowersGrid = ['delta','theta','alpha','beta','gamma'].map(band => `
      <div style="background:#162016;border:1px solid #1e2e1e;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:10px;color:#10b981;font-weight:600;text-transform:capitalize;margin-bottom:6px;">${band}</div>
        <div style="font-family:monospace;font-size:13px;font-weight:700;color:#f0faf0;">${((data.band_powers as unknown as Record<string,number>)?.[band] ?? 0).toFixed(4)}</div>
      </div>`).join('')

    const severityBands = [
      { band:'Normal',   range:'24–30', color:'#10b981', desc:'No significant impairment' },
      { band:'Mild',     range:'18–23', color:'#f59e0b', desc:'Mild cognitive impairment' },
      { band:'Moderate', range:'10–17', color:'#f97316', desc:'Moderate dementia patterns' },
      { band:'Severe',   range:'0–9',   color:'#ef4444', desc:'Severe impairment' },
    ].map(b => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px;border:1px solid ${b.band === data.severity?.band ? b.color + '60' : '#1e2e1e'};background:${b.band === data.severity?.band ? b.color + '12' : 'transparent'};margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${b.color};display:inline-block;flex-shrink:0;"></span>
          <span style="font-weight:600;font-size:13px;color:${b.band === data.severity?.band ? b.color : '#f0faf0'};">${b.band}</span>
          <span style="font-size:11px;color:#6b8f6b;">${b.desc}</span>
        </div>
        <span style="font-family:monospace;font-size:12px;color:#6b8f6b;">${b.range}</span>
      </div>`).join('')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NeuroPulse Analysis Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    background: #070b07;
    color: #f0faf0;
    font-family: 'Inter', sans-serif;
    padding: 32px;
    min-height: 100vh;
  }
  
  h1, h2, h3 {
    font-family: 'Syne', sans-serif;
  }
  
  .page {
    max-width: 860px;
    margin: 0 auto;
  }
  
  .card {
    background: #0f150f;
    border: 1px solid #1e2e1e;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  }
  
  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #f0faf0;
    margin-bottom: 4px;
  }
  
  .card-sub {
    font-size: 11px;
    color: #6b8f6b;
    margin-bottom: 16px;
  }
  
  .grid5 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  
  .grid3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .stat {
    background: #162016;
    border: 1px solid #1e2e1e;
    border-radius: 12px;
    padding: 14px;
    text-align: center;
  }
  
  .stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #f0faf0;
  }
  
  .stat-lbl {
    font-size: 11px;
    color: #6b8f6b;
    margin-top: 4px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th {
    padding: 8px 12px;
    text-align: left;
    font-size: 11px;
    color: #6b8f6b;
    font-weight: 600;
    background: #162016;
  }
  
  .disclaimer {
    font-size: 10px;
    color: #4a6a4a;
    line-height: 1.6;
    padding: 14px 16px;
    border: 1px solid #1e2e1e;
    border-radius: 10px;
    background: #070b07;
  }
  
  @media print {
    body {
      padding: 0;
      background: white;
    }
    .card {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    @page {
      size: A4;
      margin: 20mm;
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .text-gradient {
    background: linear-gradient(135deg, #10b981, #0d9488);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>
</head>
<body>
<div class="page">

<!-- Header -->
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #1e2e1e;">
  <div style="display:flex;align-items:center;gap:14px;">
    <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#10b981,#0d9488);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:white;font-family:'Syne',sans-serif;font-weight:800;font-size:14px;">NP</span>
    </div>
    <div>
      <h1 style="font-size:22px;font-family:'Syne',sans-serif;background:linear-gradient(135deg,#10b981,#0d9488);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">NeuroPulse</h1>
      <p style="font-size:11px;color:#6b8f6b;margin-top:2px;">EEG Cognitive Assessment Report</p>
    </div>
  </div>
  <div style="text-align:right;">
    <p style="font-size:12px;color:#8aaa8a;">${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
    <p style="font-size:11px;color:#4a6a4a;margin-top:2px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${data.eeg_stats?.filename ?? 'EEG File'}</p>
  </div>
</div>

<!-- MMSE Score Card -->
<div class="card" style="border-color:${sevColor}30;background:linear-gradient(135deg,#0f150f 60%,#162016);">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;">
    <div>
      <div class="card-title">Predicted MMSE Score</div>
      <div class="card-sub">Mini-Mental State Examination · Based on ${data.eeg_stats?.n_epochs ?? 0} epochs</div>
      <div style="font-family:'Syne',sans-serif;font-size:64px;font-weight:800;line-height:1;background:linear-gradient(135deg,${sevColor},#0d9488);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${data.predicted_mmse}</div>
      <p style="color:#6b8f6b;font-size:13px;margin-top:4px;">out of 30</p>
      <div style="margin-top:16px;height:8px;background:#162016;border-radius:99px;overflow:hidden;width:280px;">
        <div style="height:100%;width:${Math.min((data.predicted_mmse/30)*100,100)}%;background:linear-gradient(to right,${sevColor},#0d9488);border-radius:99px;"></div>
      </div>
    </div>
    <div style="text-align:center;">
      <div style="display:inline-block;padding:12px 24px;border-radius:12px;border:2px solid ${sevColor}60;background:${sevColor}15;font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:${sevColor};">${data.severity?.band}</div>
      <p style="font-size:11px;color:#6b8f6b;margin-top:8px;">${data.severity?.range}</p>
      <p style="font-size:12px;color:#8aaa8a;margin-top:4px;max-width:200px;">${data.severity?.description ?? ''}</p>
      ${data.severity?.recommendation ? `<p style="font-size:11px;color:#f0faf0;margin-top:8px;max-width:200px;line-height:1.4;">${data.severity.recommendation}</p>` : ''}
    </div>
  </div>
</div>

<!-- Recording Details -->
<div class="card">
  <div class="card-title">Recording Details</div>
  <div class="card-sub">Technical EEG file information</div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">
    ${[
      {label:'Channels',    val:`${data.eeg_stats?.n_channels ?? '—'}`},
      {label:'Epochs',      val:`${data.eeg_stats?.n_epochs ?? '—'}`},
      {label:'Sample Rate', val:`${data.eeg_stats?.sfreq ?? '—'} Hz`},
      {label:'Epoch Len',   val:`${data.eeg_stats?.epoch_sec ?? '—'}s`},
      {label:'Duration',    val:`${data.eeg_stats?.total_duration_sec ?? '—'}s`},
    ].map(({label,val})=>`<div class="stat"><div class="stat-val" style="font-size:16px;">${val}</div><div class="stat-lbl">${label}</div></div>`).join('')}
  </div>
</div>

<!-- Band Powers -->
<div class="card">
  <div class="card-title">Brainwave Band Powers</div>
  <div class="card-sub">EEG frequency band analysis</div>
  <div class="grid5">${bandPowersGrid}</div>
  <div style="margin-top:16px;">
    <p style="font-size:11px;color:#6b8f6b;font-weight:600;margin-bottom:10px;">Spectral Ratios</p>
    <div class="grid3">
      ${[
        {label:'Theta/Alpha',   val:(data.spectral_ratios?.theta_alpha_ratio??0).toFixed(4)},
        {label:'Delta/Alpha',   val:(data.spectral_ratios?.delta_alpha_ratio??0).toFixed(4)},
        {label:'Slowing Index', val:(data.spectral_ratios?.slowing_index??0).toFixed(4)},
      ].map(({label,val})=>`<div class="stat"><div class="stat-val" style="font-size:16px;">${val}</div><div class="stat-lbl">${label}</div></div>`).join('')}
    </div>
  </div>
</div>

<!-- XAI Features -->
<div class="card">
  <div class="card-title">XAI Feature Importance (SHAP)</div>
  <div class="card-sub">Top contributing EEG features</div>
  <table>
    <thead>
      <tr><th>#</th><th>Feature</th><th>SHAP Value</th><th>Direction</th></tr>
    </thead>
    <tbody>${featRows}</tbody>
  </table>
</div>

<!-- Electrode Contribution -->
<div class="card">
  <div class="card-title">Electrode Contribution</div>
  <div class="card-sub">Brain regions influencing the prediction</div>
  ${channelBars}
</div>

<!-- Clinical Interpretation -->
<div class="card">
  <div class="card-title">Clinical Interpretation</div>
  <div class="card-sub">AI-generated XAI explanation</div>
  ${featureSentences}
  ${data.xai_text?.clinical_summary ? `<div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:14px;margin-top:14px;"><p style="font-size:12px;color:#8aaa8a;line-height:1.6;">${data.xai_text.clinical_summary}</p></div>` : ''}
  ${data.xai_text?.recommendation ? `<div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:14px;margin-top:10px;"><p style="font-size:11px;font-weight:600;color:#f59e0b;margin-bottom:4px;">Recommendation</p><p style="font-size:12px;color:#d97706;line-height:1.5;">${data.xai_text.recommendation}</p></div>` : ''}
  ${data.xai_text?.top_channel ? `<p style="font-size:12px;color:#6b8f6b;margin-top:12px;">Most active region: <span style="color:#0d9488;font-weight:600;">Electrode ${data.xai_text.top_channel}</span></p>` : ''}
</div>

<!-- Severity Reference -->
<div class="card">
  <div class="card-title">Severity Classification Reference</div>
  <div style="margin-top:4px;">${severityBands}</div>
  <p style="font-size:11px;color:#4a6a4a;text-align:center;margin-top:10px;">MMSE: 0 (severe) → 30 (normal)</p>
</div>

<!-- Disclaimer -->
<div class="disclaimer">
  <strong style="color:#6b8f6b;">⚠ Medical Disclaimer:</strong>&nbsp;
  ${data.xai_text?.disclaimer ?? 'This report is generated by NeuroPulse for research and clinical support purposes only. It is not a substitute for professional medical diagnosis or neuropsychological evaluation. Always consult a qualified healthcare professional.'}
  <br/><br/>
  <span>Generated by <strong style="color:#10b981;">NeuroPulse</strong> · Designed by <strong style="color:#10b981;">Vimansa Abhayasekara</strong> · ${new Date().toISOString()}</span>
</div>

<!-- Print Instructions -->
<div style="text-align:center; margin-top: 20px; font-size: 11px; color: #4a6a4a;">
  <p>💡 To save as PDF: Press Ctrl+P (or Cmd+P) and select "Save as PDF"</p>
</div>

</div>
</body>
</html>`

  
    const filename = `NeuroPulse_Report_${Date.now()}.html`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}