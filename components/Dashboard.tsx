'use client'

export default function Dashboard() {
  return (
    <div className="container mx-auto max-w-7xl p-5">
      <div className="text-center text-white bg-white/10 p-8 rounded-2xl mb-8 backdrop-blur">
        <h1 className="text-4xl font-bold mb-4">🎯 얼굴인식 통합 분석 대시보드</h1>
        <p className="text-lg">Liveness, Matching, Sensor, Process Time 데이터를 통합 분석합니다</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold">대시보드 준비중...</h2>
      </div>
    </div>
  )
}