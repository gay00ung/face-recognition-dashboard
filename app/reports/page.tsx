'use client'

import Layout from '@/components/Layout'

export default function ReportsPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">리포트</h1>
          <p className="text-gray-600">분석 리포트를 생성하고 다운로드합니다</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">리포트 기능 준비중</h2>
          <p className="text-gray-600">곧 추가될 예정입니다!</p>
          
          <div className="mt-8 space-y-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              📊 일일 리포트 생성
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors ml-4">
              📈 주간 리포트 생성
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}