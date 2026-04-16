import { NextRequest, NextResponse } from 'next/server'
import { spawnSync }                  from 'child_process'
import { getPythonCmd }               from '@/lib/utils'
import path from 'path'
import fs   from 'fs'
import os   from 'os'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  let tmpPath = ''
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ valid: false, message: 'No file provided.', filename: '' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.set')) {
      return NextResponse.json(
        { valid: false, message: 'Invalid file format. Only .set files are accepted.', filename: file.name },
        { status: 200 }
      )
    }

    // Write to temp file
    const buffer = Buffer.from(await file.arrayBuffer())
    tmpPath = path.join(os.tmpdir(), `np_validate_${Date.now()}.set`)
    fs.writeFileSync(tmpPath, buffer)

    const pythonCmd  = getPythonCmd()
    const scriptPath = path.join(process.cwd(), 'inference.py')

    const result = spawnSync(pythonCmd, [scriptPath, 'validate', tmpPath], {
      encoding:  'utf-8',
      timeout:   55000,
      cwd:       process.cwd(),
      maxBuffer: 2 * 1024 * 1024,
      env: { ...process.env, PYTHONPATH: process.cwd() },
    })

    if (result.error) {
      console.error('[validate] spawn error:', result.error.message)
      if (result.error.message.includes('ENOENT')) {
        const alt    = pythonCmd === 'python' ? 'python3' : 'python'
        const retry  = spawnSync(alt, [scriptPath, 'validate', tmpPath], {
          encoding: 'utf-8', timeout: 55000, cwd: process.cwd(), maxBuffer: 2 * 1024 * 1024,
        })
        if (!retry.error && retry.status === 0) {
          const res = JSON.parse(retry.stdout)
          return NextResponse.json(res)
        }
      }
      return NextResponse.json({ valid: false, message: 'Python not found. Run: pip install the requirements.', filename: file.name }, { status: 200 })
    }

    if (result.status !== 0) {
      console.error('[validate] stderr:', result.stderr)
      return NextResponse.json({ valid: false, message: result.stderr || 'Validation failed.', filename: file.name }, { status: 200 })
    }

    const parsed = JSON.parse(result.stdout.trim())
    return NextResponse.json(parsed)

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[validate] error:', msg)
    return NextResponse.json({ valid: false, message: msg, filename: '' }, { status: 500 })
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath) } catch (_) {}
    }
  }
}
