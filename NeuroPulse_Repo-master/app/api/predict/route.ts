import { NextRequest, NextResponse } from 'next/server'
import { spawnSync }                  from 'child_process'
import { getPythonCmd }               from '@/lib/utils'
import path from 'path'
import fs   from 'fs'
import os   from 'os'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  let tmpPath = ''
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    tmpPath = path.join(os.tmpdir(), `np_predict_${Date.now()}.set`)
    fs.writeFileSync(tmpPath, buffer)

    const pythonCmd  = getPythonCmd()
    const scriptPath = path.join(process.cwd(), 'inference.py')

    console.log('[predict] Running:', pythonCmd, scriptPath, tmpPath)

    let result = spawnSync(pythonCmd, [scriptPath, 'predict', tmpPath], {
      encoding:  'utf-8',
      timeout:   280000,
      cwd:       process.cwd(),
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, PYTHONPATH: process.cwd() }, 
    })


    if (result.error?.message?.includes('ENOENT')) {
      const alt = pythonCmd === 'python' ? 'python3' : 'python'
      console.log('[predict] Retrying with', alt)
      result = spawnSync(alt, [scriptPath, 'predict', tmpPath], {
        encoding: 'utf-8', timeout: 280000, cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024,
      })
    }

    if (result.error) {
      return NextResponse.json({ error: 'Failed to run Python script.', detail: result.error.message }, { status: 500 })
    }

    if (result.stderr) {
      console.log('[predict] stderr (info):', result.stderr.slice(-500))
    }

    if (result.status !== 0) {
      return NextResponse.json({ error: 'Inference failed.', detail: result.stderr?.slice(-300) || 'Unknown error' }, { status: 500 })
    }

    const stdout = result.stdout.trim()
    if (!stdout) {
      return NextResponse.json({ error: 'No output from inference script.' }, { status: 500 })
    }

    const parsed = JSON.parse(stdout)

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error, detail: parsed.detail }, { status: 500 })
    }

    return NextResponse.json(parsed)

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[predict] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath) } catch (_) {}
    }
  }
}
