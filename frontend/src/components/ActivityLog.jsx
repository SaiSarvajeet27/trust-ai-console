export default function ActivityLog({ log }) {
  const entries = log?.all || []
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">Activity log</h2>
      <p className="text-sm text-gray-500">
        Every AI action and the human decision that followed.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Recommendation</th>
              <th className="py-2 pr-4">Decision</th>
              <th className="py-2">By</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="whitespace-nowrap py-2 pr-4 text-gray-500">{e.timestamp}</td>
                <td className="py-2 pr-4 text-gray-800">{e.action}</td>
                <td className="py-2 pr-4 text-gray-600">{e.ai_recommendation}</td>
                <td className="py-2 pr-4 font-medium text-gray-800">{e.human_decision}</td>
                <td className="py-2 text-gray-500">{e.decided_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
