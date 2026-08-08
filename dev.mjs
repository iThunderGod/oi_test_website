import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const detached = process.argv.includes('--detached')
const childOptions = detached
  ? { stdio: 'ignore', detached: true, windowsHide: true }
  : { stdio: 'inherit' }
const children = [
  spawn(process.execPath, ['server.mjs'], childOptions),
  spawn(npmCommand, ['run', 'dev:vite'], { ...childOptions, shell: process.platform === 'win32' }),
]

if (detached) {
  for (const child of children) child.unref()
  console.log('[dev] API and Vite started in detached mode')
  process.exit(0)
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
children.forEach((child) => child.on('exit', (code) => {
  if (code && code !== 0) process.exitCode = code
}))
