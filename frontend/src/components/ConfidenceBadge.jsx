const BAND_CONFIG = {
  'High Confidence': { cls: 'confidence-badge--high', label: 'High Confidence' },
  'Review Recommended': { cls: 'confidence-badge--review', label: 'Review Recommended' },
  'Low — Verify Manually': { cls: 'confidence-badge--low', label: 'Low — Verify Manually' },
}

export default function ConfidenceBadge({ band }) {
  const config = BAND_CONFIG[band] || { cls: 'confidence-badge--review', label: band }
  return (
    <span className={`confidence-badge ${config.cls}`}>
      <span className="confidence-dot" />
      {config.label}
    </span>
  )
}
