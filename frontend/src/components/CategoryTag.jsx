import { getCategoryStyle } from '../hooks/useCategoryTag'

export default function CategoryTag({ category }) {
  if (!category) return null
  const { bg, text } = getCategoryStyle(category)
  return (
    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${bg} ${text}`}>
      {category}
    </span>
  )
}
