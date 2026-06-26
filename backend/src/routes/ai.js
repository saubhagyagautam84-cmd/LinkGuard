const express = require('express')
const router  = express.Router()

const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function askGroq(prompt) {
  const chat = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })
  return chat.choices[0].message.content.trim()
}


// POST /api/ai   { action, payload }
router.post('/', async (req, res) => {
  const { action, payload } = req.body
  try {
    let text = ''

    if (action === 'explain') {
      text = await askGroq(
        `You are a cybersecurity expert. A phishing detector flagged this URL: ${payload.url}
Reasons: ${payload.reasons.join(', ')}
Explain in 2-3 simple sentences why this link is dangerous. Use plain language for a non-technical user.`
      )
      return res.json({ result: text })
    }

    if (action === 'categorize') {
      text = await askGroq(
        `Classify this URL into exactly ONE category: ${payload.url}
Categories: Banking, Government, Shopping, Social Media, News, Healthcare, Education, Entertainment, Tech, Email, Crypto, Other
Reply with ONLY the category name. No punctuation, no explanation.`
      )
      return res.json({ result: text.trim() })
    }

    if (action === 'pattern') {
      text = await askGroq(
        `Security analyst task. User normally visits: ${payload.normalCategories.join(', ')}.
New visit: ${payload.newUrl} (category: ${payload.newCategory}).
Recent history: ${payload.recentUrls.slice(0, 10).join(', ')}
In one friendly sentence, say if this link seems unusual for their browsing pattern and why.`
      )
      return res.json({ result: text })
    }

    if (action === 'history_scan') {
      const raw = await askGroq(
        `You are a phishing detection expert. Audit these URLs and identify suspicious ones:
${payload.urls.join('\n')}

Respond ONLY with valid JSON. No markdown, no backticks, no explanation:
{"flagged":[{"url":"example.com","reason":"one sentence reason","risk":"High|Medium|Low"}],"summary":"one sentence overall summary"}
If none are suspicious, return flagged as an empty array.`
      )
      try {
        const clean = raw.replace(/```json|```/g, '').trim()
        return res.json(JSON.parse(clean))
      } catch {
        return res.json({ flagged: [], summary: raw })
      }
    }

    res.status(400).json({ error: 'Unknown action' })

  } catch (err) {
    console.error('AI route error:', err.message)
    res.status(500).json({ error: 'AI request failed', details: err.message })
  }
})

module.exports = router
