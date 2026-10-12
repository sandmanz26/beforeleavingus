// Copy guard — enforces two PRD rules in CI-able form.
//
// 1. Section 1: never show “safe”, “real” or “verified” (aman / asli /
//    terverifikasi). A wrong reassurance is worse than no app. We also ban
//    their siblings and the opposite verdicts: the product reports what
//    family members said, never a judgement about the caller.
// 2. “A feature without a reference is not built”: every feature in
//    src/data/prd.ts must cite at least one problem, stage or scenario.
//
// Run: npm run copy-guard

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = join(ROOT, 'src')
// Verdict words, banned everywhere a family member can read them.
const BANNED = /\b(safe|safely|real|really|verified|verify|verification|genuine|authentic|legit|fake|guaranteed)\b/i
// Margaret never sees the word “scam”: on a true emergency (S-04) it reads
// as an accusation against her grandchild.
const BANNED_MARGARET = /\b(scams?|scammers?|fraudsters?)\b/i
// The PM registry and the design review quote the PRD and the critique;
// both are team-only and never shown inside a family member's app.
const SKIP_FILES = new Set(['data/prd.ts', 'data/roast.ts'])

const files = []
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|css)$/.test(f) && !f.endsWith('.css')) files.push(p)
  }
}
walk(SRC)

const problems = []
for (const file of files) {
  const rel = relative(SRC, file)
  if (SKIP_FILES.has(rel)) continue
  const lines = readFileSync(file, 'utf8').split('\n')
  let inBlock = false
  lines.forEach((line, i) => {
    const t = line.trim()
    if (t.startsWith('/*')) inBlock = true
    if (inBlock) { if (t.includes('*/')) inBlock = false; return }
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import ')) return
    // only look at user-facing text: string literals and JSX text
    const strings = [...line.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2])
    const jsxText = [...line.matchAll(/>([^<>{}]+)</g)].map((m) => m[1])
    for (const s of [...strings, ...jsxText]) {
      // skip class names, ids, paths and code-ish tokens
      if (/^[\w\-./:#@]*$/.test(s) && !/\s/.test(s)) continue
      const m = s.match(BANNED) ?? (rel.startsWith('apps/margaret/') ? s.match(BANNED_MARGARET) : null)
      if (m) problems.push(`${rel}:${i + 1}  “${m[0]}” in: ${s.trim().slice(0, 90)}`)
    }
  })
}

// Rule 2 — traceability
const prd = readFileSync(join(SRC, 'data/prd.ts'), 'utf8')
const featureRe = /\{ id: '(F-[A-Z]\d)'[^\n]*problems: \[([^\]]*)\], stages: \[([^\]]*)\], scenarios: \[([^\]]*)\]/g
let count = 0
for (const m of prd.matchAll(featureRe)) {
  count++
  if (!m[2].trim() && !m[3].trim() && !m[4].trim()) problems.push(`data/prd.ts  ${m[1]} has no P/T/S reference — the PRD says it must not be built`)
}
if (count === 0) problems.push('data/prd.ts  no features found — registry format changed?')

if (problems.length) {
  console.error(`Copy guard: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log(`Copy guard: OK — ${files.length} files, ${count} features traced, no verdict words in UI copy.`)
