'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'

export default function Dashboard() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    setLoading(true)
    // TODO: 파일 처리 로직 추가
    console.log('업로드된 파일:', files)
    setTimeout(() => {
      setLoading(false)
      alert('파일 분석 기능을 구현 중입니다!')
    }, 2000)
  }

  return (
    <div className="container mx-auto max-w-7xl p-5">
      <div className="text-center text-white bg-white/10 p-8 rounded-2xl mb-8 backdrop-blur">
        <h1 className="text-4xl font-bold mb-4">🎯 얼굴인식 통합 분석 대시보드</h1>
        <p className="text-lg">Liveness, Matching, Sensor, Process Time 데이터를 통합 분석합니다</p>
      </div>
      
      <FileUpload onUpload={handleFileUpload} loading={loading} />
      
      {loading && (
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-2">데이터 분석 중...</p>
        </div>
      )}
    </div>
  )
}