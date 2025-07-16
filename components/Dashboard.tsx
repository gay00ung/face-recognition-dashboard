'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import { parseIntegratedCSV, mergeAnalysisData } from '@/lib/dataAnalysis'
import AnalysisSummary from './AnalysisSummary'

export default function Dashboard() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    setLoading(true)
    
    try {
      const fileDataArray = []
      
      // 각 파일 읽기
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const content = await file.text()
        const parsed = await parseIntegratedCSV(content, file.name)
        fileDataArray.push(parsed)
      }
      
      // 데이터 병합
      const mergedData = mergeAnalysisData(fileDataArray)
      setAnalysisData(mergedData)
      
      console.log('분석 완료:', mergedData)
      
    } catch (error) {
      console.error('파일 처리 중 오류:', error)
      alert('파일 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
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
      
      {analysisData && !loading && (
        <AnalysisSummary data={analysisData} />
      )}
    </div>
  )
}