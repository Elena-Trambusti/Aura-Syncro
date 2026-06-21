import sharp from 'sharp'
import { mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'brand', 'aura-syncro-icon.svg')
const outDir = join(root, 'public', 'pwa')
const androidDir = join(outDir, 'android')

/** Densità Android + PWA (px lato icona quadrata) */
const STANDARD_SIZES = [48, 72, 96, 128, 144, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]
const ADAPTIVE_DENSITIES = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 },
]

const BRAND_GOLD = '#C9A227'

await mkdir(outDir, { recursive: true })
await mkdir(androidDir, { recursive: true })

const svg = await readFile(svgPath)

/** Icona standard — logo a pieno canvas (purpose: any) */
async function writeStandardIcon(size) {
  await sharp(svg).resize(size, size).png().toFile(join(outDir, `icon-${size}.png`))
  console.log(`  icon-${size}.png`)
}

/**
 * Icona maskable — logo al 58% centrato su sfondo gold (zona sicura ~80% per adaptive icon)
 * @see https://w3c.github.io/manifest/#icon-masks
 */
async function writeMaskableIcon(size) {
  const logoSize = Math.round(size * 0.58)
  const offset = Math.round((size - logoSize) / 2)
  const logo = await sharp(svg).resize(logoSize, logoSize).png().toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_GOLD },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(join(outDir, `maskable-${size}.png`))

  console.log(`  maskable-${size}.png`)
}

/** Adaptive Android: foreground (logo su trasparente) + background (tinta piena) */
async function writeAdaptivePair(size, densityName) {
  const logoSize = Math.round(size * 0.58)
  const offset = Math.round((size - logoSize) / 2)
  const logo = await sharp(svg).resize(logoSize, logoSize).png().toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(join(androidDir, `ic_launcher_foreground_${densityName}.png`))

  await sharp({
    create: { width: size, height: size, channels: 3, background: BRAND_GOLD },
  })
    .png()
    .toFile(join(androidDir, `ic_launcher_background_${densityName}.png`))

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_GOLD },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(join(androidDir, `ic_launcher_${densityName}.png`))

  console.log(`  android/ic_launcher_${densityName}.png (+ foreground/background)`)
}

console.log('Generating PWA icons…')
for (const size of STANDARD_SIZES) {
  await writeStandardIcon(size)
}
for (const size of MASKABLE_SIZES) {
  await writeMaskableIcon(size)
}

/** iOS home screen — 180×180 con zona sicura */
{
  const size = 180
  const logoSize = Math.round(size * 0.58)
  const offset = Math.round((size - logoSize) / 2)
  const logo = await sharp(svg).resize(logoSize, logoSize).png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_GOLD },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(join(outDir, 'apple-touch-icon.png'))
  console.log('  apple-touch-icon.png')
}

console.log('Generating Android adaptive icons…')
for (const { name, size } of ADAPTIVE_DENSITIES) {
  await writeAdaptivePair(size, name)
}
console.log('Done.')
