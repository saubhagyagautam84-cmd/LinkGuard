const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const priya = await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: { first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com', role: 'Designer', bio: 'UI/UX designer based in Bangalore.' }
  })

  const rahul = await prisma.user.upsert({
    where: { email: 'rahul@example.com' },
    update: {},
    create: { first_name: 'Rahul', last_name: 'Verma', email: 'rahul@example.com', role: 'Developer', bio: 'Full-stack developer, open source contributor.' }
  })

  const links = [
    { label: 'React Docs',        url: 'https://react.dev',              domain: 'react.dev',              trust: 'safe',    added_by: priya.id },
    { label: 'Tailwind CSS',      url: 'https://tailwindcss.com',        domain: 'tailwindcss.com',        trust: 'safe',    added_by: priya.id },
    { label: 'Prisma ORM',        url: 'https://prisma.io',              domain: 'prisma.io',              trust: 'safe',    added_by: rahul.id },
    { label: 'SBI Net Banking',   url: 'https://sbi.co.in',              domain: 'sbi.co.in',              trust: 'safe',    added_by: rahul.id },
    { label: 'Vite Docs',         url: 'https://vitejs.dev',             domain: 'vitejs.dev',             trust: 'safe',    added_by: priya.id },
    { label: 'Figma',             url: 'https://figma.com',              domain: 'figma.com',              trust: 'safe',    added_by: priya.id },
    { label: 'Unknown Blog',      url: 'https://myblog-offer.xyz',       domain: 'myblog-offer.xyz',       trust: 'caution', added_by: priya.id },
    { label: 'Free Rewards',      url: 'https://freerewards2024.win',    domain: 'freerewards2024.win',    trust: 'caution', added_by: rahul.id },
    { label: 'Shady Download',    url: 'https://dl-free-stuff.net',      domain: 'dl-free-stuff.net',      trust: 'caution', added_by: rahul.id },
    { label: 'GitHub',            url: 'https://github.com',             domain: 'github.com',             trust: 'safe',    added_by: rahul.id },
  ]

  for (const link of links) {
    await prisma.link.create({ data: link })
  }

  const trusted = [
    { domain: 'react.dev',  user_id: priya.id },
    { domain: 'figma.com',  user_id: priya.id },
    { domain: 'prisma.io',  user_id: rahul.id },
    { domain: 'github.com', user_id: rahul.id },
  ]
  for (const t of trusted) {
    await prisma.trustedDomain.upsert({
      where: { domain_user_id: t },
      update: {},
      create: t
    })
  }

  console.log('Seeded: 2 users, 10 links, 4 trusted domains')
}

main().catch(console.error).finally(() => prisma.$disconnect())
