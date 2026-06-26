const { Router } = require('express')
const { PrismaClient } = require('@prisma/client')

const router = Router()
const prisma = new PrismaClient()

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/users  (create or upsert by email)
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, role, bio } = req.body
    if (!first_name || !email) return res.status(400).json({ error: 'first_name and email required' })
    const user = await prisma.user.upsert({
      where: { email },
      update: { first_name, last_name: last_name || '', role: role || '', bio: bio || '' },
      create: { first_name, last_name: last_name || '', email, role: role || '', bio: bio || '' }
    })
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
