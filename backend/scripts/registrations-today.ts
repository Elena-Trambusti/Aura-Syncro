/**
 * Elenco iscrizioni di oggi (fuso Europe/Rome).
 * Uso: npx tsx scripts/registrations-today.ts [YYYY-MM-DD]
 */
import { PrismaClient } from '@prisma/client'
import { formatRomeDate, formatRomeDateTime } from '../src/lib/romeDate'

const prisma = new PrismaClient()
const targetDay = process.argv[2] ?? formatRomeDate(new Date())

async function main() {
  const owners = await prisma.user.findMany({
    where: { role: 'OWNER' },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          isSetupComplete: true,
          settings: {
            select: {
              hasActiveSubscription: true,
              planTier: true,
              countryCode: true,
            },
          },
        },
      },
    },
  })

  const today = owners.filter(u => formatRomeDate(u.createdAt) === targetDay)

  console.log(`\n📋 Iscrizioni del ${targetDay} (Europe/Rome): ${today.length}\n`)

  if (today.length === 0) {
    console.log('Nessuna nuova iscrizione in questa data.')
    return
  }

  for (const u of today) {
    const s = u.restaurant.settings
    console.log(`— ${formatRomeDateTime(u.createdAt)}`)
    console.log(`  ${u.name} <${u.email}>`)
    if (u.phone) console.log(`  Tel: ${u.phone}`)
    console.log(`  Ristorante: ${u.restaurant.name} (${u.restaurant.slug})`)
    console.log(`  Piano: ${s?.planTier ?? 'BASE'} | Abbonamento: ${s?.hasActiveSubscription ? 'sì' : 'no'} | Setup: ${u.restaurant.isSetupComplete ? 'completo' : 'in attesa'}`)
    console.log('')
  }
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
