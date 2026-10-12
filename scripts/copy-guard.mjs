// Copy guard — the PRD's one hard rule on wording (§1): never tell people
// a voice is “safe”, “real” or “verified”. A wrong reassurance is more
// dangerous than no app. KinVoice may say “likely fake”, “doesn’t match”
// or “sounds like”, and always sends money decisions back to family.
//
// Run: npm run copy-guard

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = new URL('../src', import.meta.url).pathname
const BANNED = /\b(safe|safely|real|really|verified|verify|verification|genuine|authentic|legit|guaranteed|100%)\b/i

const files = []
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.tsx?$/.test(f)) files.push(p)
  }
}
walk(SRC)

const problems = []
for (const file of files) {
  const rel = relative(SRC, file)
  let inBlock = false
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const t = line.trim()
    if (t.startsWith('/*')) inBlock = true
    if (inBlock) { if (t.includes('*/')) inBlock = false; return }
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import ')) return
    const strings = [...line.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2])
    const jsxText = [...line.matchAll(/>([^<>{}]+)</g)].map((m) => m[1])
    for (const s of [...strings, ...jsxText]) {
      if (/^[\w\-./:#@]*$/.test(s) && !/\s/.test(s)) continue
      const m = s.match(BANNED)
      if (m) problems.push(`${rel}:${i + 1}  “${m[0]}” in: ${s.trim().slice(0, 90)}`)
    }
  })
}

if (problems.length) {
  console.error(`Copy guard: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log(`Copy guard: OK — ${files.length} files, no false-reassurance words in UI copy.`)
