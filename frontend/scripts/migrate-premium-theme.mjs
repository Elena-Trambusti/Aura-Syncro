/**
 * Migra classi light legacy → premium dark su pagine e componenti gestionale.
 * Esclude landing, public menu e pagine marketing esterne.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')

const EXCLUDE_RE = [
  /[\\/]landing[\\/]/,
  /[\\/]public[\\/]/,
  /LandingPage\.tsx$/,
  /LandingRoute\.tsx$/,
  /PricingPage\.tsx$/,
  /TermsPage\.tsx$/,
  /PrivacyPage\.tsx$/,
  /PublicMenuPage\.tsx$/,
  /PublicReservationPage\.tsx$/,
]

const REPLACEMENTS = [
  ['text-slate-900', 'text-pietra'],
  ['text-slate-800', 'text-pietra'],
  ['text-slate-700', 'text-fumo'],
  ['text-slate-600', 'text-fumo'],
  ['text-slate-500', 'text-fumo'],
  ['border-slate-200', 'border-white/[0.08]'],
  ['border-slate-300', 'border-white/[0.1]'],
  ['divide-slate-200', 'divide-white/[0.06]'],
  ['hover:bg-slate-50', 'hover:bg-white/[0.05]'],
  ['hover:bg-slate-100', 'hover:bg-white/[0.05]'],
  ['bg-slate-50', 'bg-navy-surface/50'],
  ['bg-slate-100', 'bg-navy-surface'],
  ['bg-slate-200', 'bg-navy-surface'],
  ['bg-red-50', 'bg-red-500/10'],
  ['text-red-700', 'text-red-400'],
  ['text-red-600', 'text-red-400'],
  ['border-red-200', 'border-red-500/25'],
  ['bg-amber-50', 'bg-aura-gold/10'],
  ['text-amber-700', 'text-aura-gold'],
  ['text-amber-600', 'text-aura-gold'],
  ['border-amber-200', 'border-aura-gold/25'],
  ['border-amber-300', 'border-aura-gold/30'],
  ['bg-emerald-50', 'bg-emerald-500/10'],
  ['text-emerald-700', 'text-emerald-400'],
  ['text-emerald-600', 'text-emerald-400'],
  ['border-emerald-200', 'border-emerald-500/25'],
  ['bg-blue-50', 'bg-blue-500/10'],
  ['text-blue-700', 'text-blue-400'],
  ['text-blue-600', 'text-blue-400'],
  ['border-blue-200', 'border-blue-500/25'],
  ['bg-violet-50', 'bg-violet-500/10'],
  ['text-violet-700', 'text-violet-400'],
  ['bg-amber-600 text-white', 'bg-aura-gold text-navy font-semibold'],
  ['bg-amber-500 text-white', 'bg-aura-gold text-navy font-semibold'],
  ['hover:bg-amber-600', 'hover:bg-aura-gold-light'],
  ['hover:bg-amber-700', 'hover:bg-aura-gold-light'],
  ['hover:text-amber-600', 'hover:text-aura-gold'],
  ['hover:text-red-600', 'hover:text-red-400'],
  ['hover:border-amber-300', 'hover:border-aura-gold/30'],
  ['focus:ring-amber-500/40', 'focus:ring-aura-gold/30'],
  ['focus:border-amber-500', 'focus:border-aura-gold/50'],
  ['rounded-xl border border-white/[0.08] bg-navy-elevated p-8 text-center shadow-sm', 'premium-card p-8 text-center'],
  ['rounded-xl border border-white/[0.08] bg-navy-elevated p-8 text-center shadow-sm', 'premium-card p-8 text-center'],
]

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(full)
  }
  return out
}

function shouldProcess(file) {
  if (EXCLUDE_RE.some(re => re.test(file))) return false
  return true
}

function migrate(content) {
  let next = content
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to)
  }
  return next
}

const dirs = ['pages', 'components', 'lib'].map(d => path.join(ROOT, d))
let changed = 0

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue
  for (const file of walk(dir)) {
    if (!shouldProcess(file)) continue
    const original = fs.readFileSync(file, 'utf8')
    const updated = migrate(original)
    if (updated !== original) {
      fs.writeFileSync(file, updated)
      changed++
      console.log('updated:', path.relative(ROOT, file))
    }
  }
}

console.log(`\nDone. ${changed} file(s) updated.`)
