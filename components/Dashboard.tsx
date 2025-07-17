'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import AnalysisSummary from './AnalysisSummary'
import LightSuccessChart from './charts/LightSuccessChart'
import MatchingScoreChart from './charts/MatchingScoreChart'
import { parseIntegratedCSV, mergeAnalysisData } from '@/lib/dataAnalysis'

export default function Dashboard() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    setLoading(true)
    
    try {
      const fileDataArray = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const content = await file.text()
        const parsed = await parseIntegratedCSV(content, file.name)
        fileDataArray.push(parsed)
      }
      
      const mergedData = mergeAnalysisData(fileDataArray)
      setAnalysisData(mergedData)
      setShowUpload(false)
      
    } catch (error) {
      console.error('파일 처리 중 오류:', error)
      alert('파일 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">얼굴인식 분석 대시보드</h1>
        <p className="text-gray-600">Liveness, Matching, Sensor, Process Time 데이터를 통합 분석합니다</p>
      </div>

      {/* 빠른 작업 버튼들 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          📁 새 데이터 업로드
        </button>
        <button className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow border border-gray-200">
          📊 리포트 생성
        </button>
        <button className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow border border-gray-200">
          ⚙️ 설정
        </button>
      </div>

      {/* 파일 업로드 섹션 */}
      {showUpload && (
        <div className="mb-8 animate-fadeIn">
          <FileUpload onUpload={handleFileUpload} loading={loading} />
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">데이터 분석 중...</p>
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {analysisData && !loading && (
        <div className="space-y-6 animate-fadeIn">
          <AnalysisSummary data={analysisData} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LightSuccessChart data={analysisData} />
            <MatchingScoreChart data={analysisData} />
          </div>
        </div>
      )}

      {/* 데이터 없을 때 */}
      {!analysisData && !loading && !showUpload && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">데이터를 업로드해주세요</h2>
          <p className="text-gray-600 mb-6">CSV 파일을 업로드하여 분석을 시작하세요</p>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            업로드 시작
          </button>
        </div>
      )}
    </div>
  )
}