require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const linksRouter         = require('./routes/links')
const usersRouter         = require('./routes/users')
const trustedDomainsRouter= require('./routes/trustedDomains')
const aiRouter            = require('./routes/ai')
const checkUrlRouter      = require('./routes/checkUrl')
const threatsRouter       = require('./routes/threats')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/links',           linksRouter)
app.use('/api/users',           usersRouter)
app.use('/api/trusted-domains', trustedDomainsRouter)
app.use('/api/ai',              aiRouter)
app.use('/api/check-url',       checkUrlRouter)
app.use('/api/threats',         threatsRouter)

const PORT = 3001
app.listen(PORT, () => console.log(`LinkGuard API running on http://localhost:${PORT}`))
