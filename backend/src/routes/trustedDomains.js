const { Router } = require('express')
const { PrismaClient } = require('@prisma/client')

const router = Router()
const prisma = new PrismaClient()

// GET /api/trusted-domains/:userId
router.get('/:userId', async (req, res) => {
  try {
    const domains = await prisma.trustedDomain.findMany({
      where: { user_id: req.params.userId },
      orderBy: { created_at: 'desc' }
    })
    res.json(domains)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/trusted-domains
router.post('/', async (req, res) => {
  try {
    const { domain, user_id } = req.body
    const td = await prisma.trustedDomain.create({ data: { domain, user_id } })
    res.json(td)
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Domain already trusted' })
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/trusted-domains/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.trustedDomain.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
