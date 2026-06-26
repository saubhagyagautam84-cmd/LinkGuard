import { useState } from 'react'
import { categorizeUrl } from '../services/aiService'

export const CATEGORY_COLORS = {
  Banking:        { bg: 'bg-blue-50',    text: 'text-blue-700'    },
  Government:     { bg: 'bg-orange-50',  text: 'text-orange-700'  },
  Shopping:       { bg: 'bg-pink-50',    text: 'text-pink-700'    },
  'Social Media': { bg: 'bg-sky-50',     text: 'text-sky-700'     },
  News:           { bg: 'bg-yellow-50',  text: 'text-yellow-700'  },
  Healthcare:     { bg: 'bg-teal-50',    text: 'text-teal-700'    },
  Education:      { bg: 'bg-indigo-50',  text: 'text-indigo-700'  },
  Entertainment:  { bg: 'bg-rose-50',    text: 'text-rose-700'    },
  Tech:           { bg: 'bg-violet-50',  text: 'text-violet-700'  },
  Crypto:         { bg: 'bg-amber-50',   text: 'text-amber-700'   },
  Other:          { bg: 'bg-gray-100',   text: 'text-gray-600'    },
}

export function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
}

export function useCategoryTag() {
  const [category, setCategory] = useState(null)
  const [loading,  setLoading]  = useState(false)

  const classify = async (url) => {
    setLoading(true)
    try {
      const data = await categorizeUrl(url)
      setCategory(data.result)
      return data.result
    } catch {
      setCategory('Other')
      return 'Other'
    } finally {
      setLoading(false)
    }
  }

  return { category, loading, classify }
}
