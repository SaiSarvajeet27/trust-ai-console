import ConfidenceBadge from './ConfidenceBadge'

export default function RecommendationCard({ rec, onOpen }) {
  return (
    <button
      onClick={() => onOpen(rec.id)}
      className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{rec.action}</h3>
          <p className="text-sm text-gray-500">{rec.target_summary}</p>
        </div>
        <ConfidenceBadge band={rec.confidence_band} />
      </div>
      <p className="mt-3 text-sm text-gray-600">{rec.reasoning_steps?.[0]}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{rec.data_sources?.length} sources</span>
        <span className="capitalize">{rec.status}</span>
      </div>
    </button>
  )
}
