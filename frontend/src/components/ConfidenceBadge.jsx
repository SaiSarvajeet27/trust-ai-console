// Contextual confidence band -- deliberately a label + colour, never a number.
const STYLES = {
  'High Confidence': 'bg-green-100 text-green-800 border-green-300',
  'Review Recommended': 'bg-amber-100 text-amber-800 border-amber-300',
  'Low — Verify Manually': 'bg-red-100 text-red-800 border-red-300',
}

export default function ConfidenceBadge({ band }) {
  const cls = STYLES[band] || 'bg-gray-100 text-gray-700 border-gray-300'
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium ${cls}`}>
      {band}
    </span>
  )
}
