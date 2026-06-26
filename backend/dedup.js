const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const links = await p.link.findMany({ orderBy: { created_at: 'asc' } })
  const seen = new Set()
  const toDelete = []
  for (const l of links) {
    const key = l.label + l.added_by
    if (seen.has(key)) toDelete.push(l.id)
    else seen.add(key)
  }
  const r = await p.link.deleteMany({ where: { id: { in: toDelete } } })
  console.log('Removed duplicates:', r.count)
  console.log('Remaining links:', links.length - r.count)
}

main().catch(console.error).finally(() => p.$disconnect())
