import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const EXCLUDE_RE = [/[\\/]landing[\\/]/, /[\\/]public[\\/]/, /PublicMenuPage/, /PublicReservationPage/]

const REPLACEMENTS = [
  ['border-slate-100', 'border-white/[0.06]'],
  ['text-slate-400', 'text-fumo'],
  ['bg-aura-gold text-white', 'bg-aura-gold text-navy font-semibold'],
  ['min-h-screen bg-slate-50', 'min-h-screen bg-navy'],
  ['rounded-2xl border border-white/[0.08] bg-navy-elevated p-6 shadow-sm', 'premium-card p-6'],
  ['rounded-3xl p-8 shadow-sm border border-white/[0.06]', 'premium-card p-8'],
  ['min-h-screen bg-navy-elevated flex', 'min-h-screen bg-navy flex'],
]

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (/\.tsx$/.test(ent.name)) out.push(full)
  }
  return out
}

let n = 0
for (const dir of ['pages', 'components'].map(d => path.join(ROOT, d))) {
  for (const file of walk(dir)) {
    if (EXCLUDE_RE.some(re => re.test(file))) continue
    let c = fs.readFileSync(file, 'utf8')
    const o = c
    for (const [a, b] of REPLACEMENTS) c = c.split(a).join(b)
    if (c !== o) { fs.writeFileSync(file, c); n++; console.log(path.relative(ROOT, file)) }
  }
}
console.log(`Done: ${n}`)
