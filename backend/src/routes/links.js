const { Router } = require('express')
const { PrismaClient } = require('@prisma/client')

const router = Router()
const prisma = new PrismaClient()

// GET /api/links
router.get('/', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      include: { user: true },
      orderBy: { created_at: 'desc' }
    })
    res.json(links)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/links/mine/:userId
router.get('/mine/:userId', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { added_by: req.params.userId },
      include: { user: true },
      orderBy: { created_at: 'desc' }
    })
    res.json(links)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/links
router.post('/', async (req, res) => {
  try {
    const { label, url, domain, trust, added_by } = req.body
    const link = await prisma.link.create({
      data: { label, url, domain, trust: trust || 'caution', added_by },
      include: { user: true }
    })
    res.json(link)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
