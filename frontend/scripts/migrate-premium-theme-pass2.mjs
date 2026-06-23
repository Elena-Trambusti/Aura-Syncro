/** Second pass: bg-white → navy elevated (esclude landing/public) */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const EXCLUDE_RE = [
  /[\\/]landing[\\/]/,
  /[\\/]public[\\/]/,
  /LandingPage\.tsx$/,
  /PricingPage\.tsx$/,
  /TermsPage\.tsx$/,
  /PrivacyPage\.tsx$/,
  /PublicMenuPage\.tsx$/,
  /PublicReservationPage\.tsx$/,
  /PaymentSuccessPage\.tsx$/,
  /PaymentCancelPage\.tsx$/,
  /PaymentDepositSuccessPage\.tsx$/,
]

const REPLACEMENTS = [
  ['bg-aura-gold/100', 'bg-aura-gold'],
  ['border border-white/[0.08] bg-white', 'premium-card'],
  ['rounded-xl border border-white/[0.08] bg-white', 'premium-card'],
  ['rounded-2xl border border-white/[0.08] bg-white', 'premium-card'],
  ['rounded-lg border border-white/[0.08] bg-white', 'premium-card'],
  ["bg: 'bg-white'", "bg: 'bg-navy-elevated'"],
  ['bg-white p-', 'bg-navy-elevated p-'],
  ['bg-white shadow', 'bg-navy-elevated shadow'],
  ['bg-white flex', 'bg-navy-elevated flex'],
  ['bg-white px-', 'bg-navy-elevated px-'],
  ['bg-white rounded', 'bg-navy-elevated rounded'],
  ['bg-white overflow', 'bg-navy-elevated overflow'],
  ['bg-white w-full', 'bg-navy-elevated w-full'],
  ['bg-white text-center', 'bg-navy-elevated text-center'],
  ['inline-flex items-center rounded-lg border border-white/[0.08] bg-white', 'inline-flex items-center rounded-lg saas-chip'],
  ['bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800', 'saas-btn-primary w-full py-3 text-sm'],
  ['bg-amber-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-aura-gold-light', 'saas-btn-primary w-full py-3.5 text-sm'],
]

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (/\.tsx$/.test(ent.name)) out.push(full)
  }
  return out
}

let changed = 0
for (const dir of ['pages', 'components'].map(d => path.join(ROOT, d))) {
  for (const file of walk(dir)) {
    if (EXCLUDE_RE.some(re => re.test(file))) continue
    let content = fs.readFileSync(file, 'utf8')
    const original = content
    for (const [from, to] of REPLACEMENTS) content = content.split(from).join(to)
    if (content !== original) {
      fs.writeFileSync(file, content)
      changed++
      console.log('updated:', path.relative(ROOT, file))
    }
  }
}
console.log(`Done. ${changed} files.`)
