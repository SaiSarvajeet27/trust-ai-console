import { useState } from 'react'
import ConfidenceBadge from './ConfidenceBadge'

// Visual weight for the "Ask Why" factor bars.
const WEIGHT = { major: 'w-full', moderate: 'w-2/3', minor: 'w-1/3' }

export default function RecommendationDetail({ rec, onBack, onDecision }) {
  const [showWhy, setShowWhy] = useState(false)
  const [showAlts, setShowAlts] = useState(false)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <button onClick={onBack} className="text-sm text-blue-600">&larr; Back</button>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{rec.action}</h2>
          <p className="text-sm text-gray-500">{rec.target_summary}</p>
        </div>
        <ConfidenceBadge band={rec.confidence_band} />
      </div>
      <p className="mt-1 text-sm text-gray-600">{rec.confidence_driver}</p>

      {/* 1. Reasoning steps */}
      <section className="mt-6">
        <h4 className="font-semibold text-gray-800">Why this recommendation</h4>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
          {rec.reasoning_steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </section>

      {/* 4. Limitations (conditional) */}
      {rec.limitations?.length > 0 && (
        <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <h4 className="text-sm font-semibold text-amber-800">Worth knowing</h4>
          <ul className="mt-1 list-disc pl-5 text-sm text-amber-800">
            {rec.limitations.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>
      )}

      {/* 3. Data sources */}
      <section className="mt-4">
        <h4 className="text-sm font-semibold text-gray-800">Based on</h4>
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          {rec.data_sources.map((d, i) => (
            <li key={i}>
              <span className="mr-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {d.type}
              </span>
              {d.description}
            </li>
          ))}
        </ul>
      </section>

      {/* Ask Why -> factors */}
      {showWhy && (
        <section className="mt-4 rounded-lg bg-gray-50 p-3">
          <h4 className="text-sm font-semibold text-gray-800">Factors that mattered</h4>
          <div className="mt-2 space-y-2">
            {rec.factors.map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{f.factor}</span>
                  <span className="capitalize">{f.weight}</span>
                </div>
                <div className="h-2 rounded bg-gray-200">
                  <div className={`h-2 rounded bg-blue-500 ${WEIGHT[f.weight] || 'w-1/3'}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* See Alternatives */}
      {showAlts && (
        <section className="mt-4 rounded-lg bg-gray-50 p-3">
          <h4 className="text-sm font-semibold text-gray-800">Other options considered</h4>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {rec.alternatives.map((a, i) => (
              <li key={i}>
                <span className="font-medium">{a.action}</span>{' '}
                <span className="text-gray-500">— {a.tradeoff}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. Human-in-the-loop controls */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => onDecision(rec.id, 'approved')}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">
          Approve
        </button>
        <button onClick={() => onDecision(rec.id, 'overridden')}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800">
          Override
        </button>
        <button onClick={() => setShowWhy((v) => !v)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
          Ask Why
        </button>
        <button onClick={() => setShowAlts((v) => !v)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
          See Alternatives
        </button>
        <button onClick={() => onDecision(rec.id, 'escalated')}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
          Escalate
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Status: <span className="capitalize">{rec.status}</span>
      </p>
    </div>
  )
}
