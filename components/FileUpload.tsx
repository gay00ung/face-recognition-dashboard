'use client'

import { useState } from 'react'

interface FileUploadProps {
  onUpload: (files: FileList) => void
  loading: boolean
}

export default function FileUpload({ onUpload, loading }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleAnalyze = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles as any)
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">CSV 파일 업로드</h2>
      <p className="text-gray-600 mb-6">하나 또는 여러 개의 CSV 파일을 선택해주세요</p>
      
      <div className="relative inline-block">
        <input
          type="file"
          multiple
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-10 py-4 rounded-full font-bold hover:shadow-lg transition-all">
          📁 파일 선택 (여러 개 가능)
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">선택된 파일:</h3>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                <span>📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                <button
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '분석 중...' : '📊 분석 시작'}
          </button>
        </div>
      )}
    </div>
  )
}