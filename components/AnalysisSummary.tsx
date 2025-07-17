'use client'

interface AnalysisSummaryProps {
  data: any
}

export default function AnalysisSummary({ data }: AnalysisSummaryProps) {
  // 통계 계산
  const calculateStats = () => {
    const total = data.merged.length

    // Liveness 통계
    const livenessSuccess = data.merged.filter((d: any) => d.liveness?.result === 1).length
    const livenessFail = data.merged.filter((d: any) => d.liveness?.result === 0).length
    const livenessRate = total > 0 ? (livenessSuccess / total * 100).toFixed(1) : '0'

    // Matching 통계
    const matchingSuccess = data.merged.filter((d: any) => d.matching?.result === 1).length
    const matchingFail = data.merged.filter((d: any) => d.matching?.result === 0).length
    const matchingRate = total > 0 ? (matchingSuccess / total * 100).toFixed(1) : '0'

    // 완전 성공률
    const completeSuccess = data.merged.filter((d: any) =>
      d.liveness?.result === 1 && d.matching?.result === 1
    ).length
    const completeRate = total > 0 ? (completeSuccess / total * 100).toFixed(1) : '0'

    return {
      total,
      livenessSuccess,
      livenessFail,
      livenessRate,
      matchingSuccess,
      matchingFail,
      matchingRate,
      completeSuccess,
      completeRate
    }
  }

  const stats = calculateStats()

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6">📊 전체 통계</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl transition-transform hover:scale-105">
          <div className="text-sm text-gray-600 mb-1">전체 시도 횟수</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl transition-transform hover:scale-105">
          <div className="text-sm text-gray-600 mb-1">Liveness 성공률</div>
          <div className="text-3xl font-bold text-green-600">{stats.livenessRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            성공: {stats.livenessSuccess} | 실패: {stats.livenessFail}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl transition-transform hover:scale-105">
          <div className="text-sm text-gray-600 mb-1">Matching 성공률</div>
          <div className="text-3xl font-bold text-purple-600">{stats.matchingRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            성공: {stats.matchingSuccess} | 실패: {stats.matchingFail}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl transition-transform hover:scale-105">
          <div className="text-sm text-gray-600 mb-1">완전 성공률</div>
          <div className="text-3xl font-bold text-orange-600">{stats.completeRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            Liveness & Matching 모두 성공
          </div>
        </div>
      </div>

      {/* 파일별 통계 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">📁 파일별 데이터</h3>
        <div className="space-y-2">
          {Object.entries(
            data.liveness.reduce((acc: any, item: any) => {
              acc[item._sourceFile] = (acc[item._sourceFile] || 0) + 1
              return acc
            }, {})
          ).map(([fileName, count]) => (
            <div key={fileName} className="flex justify-between text-sm">
              <span className="text-gray-600">{fileName}</span>
              <span className="font-medium">{count as number}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}