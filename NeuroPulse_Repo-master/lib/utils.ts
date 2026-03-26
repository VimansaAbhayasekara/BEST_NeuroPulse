// lib/utils.ts
import path from 'path';
import fs from 'fs';

export function getPythonCmd(): string {
  // Check for virtual environment Python first
  const venvPython = path.join(process.cwd(), 'neuropulse_env', 'Scripts', 'python.exe');
  
  if (fs.existsSync(venvPython)) {
    console.log(`[utils] Using venv Python: ${venvPython}`);
    return venvPython;
  }
  
  // Fallback to system Python
  console.log('[utils] Using system Python');
  return 'python';
}