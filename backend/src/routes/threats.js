const express = require('express')
const router  = express.Router()

const FEED = [
  { url: 'paypa1-secure.xyz',       category: 'Banking' },
  { url: 'free-rewards2024.win',    category: 'Phishing' },
  { url: 'sbi-netbanking.tk',       category: 'Banking' },
  { url: 'irctc-refund.online',     category: 'Government' },
  { url: 'amazon-lucky-draw.club',  category: 'Shopping' },
  { url: 'hdfcbank-update.ml',      category: 'Banking' },
  { url: 'incomtax-refund.xyz',     category: 'Government' },
  { url: 'flipkart-giveaway.top',   category: 'Shopping' },
  { url: 'uidai-kyc-verify.pw',     category: 'Government' },
  { url: 'google-account-verify.cf',category: 'Tech' },
]

// GET /api/threats/feed
router.get('/feed', (req, res) => res.json(FEED))

module.exports = router
