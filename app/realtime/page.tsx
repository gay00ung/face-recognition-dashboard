'use client'

import dynamic from 'next/dynamic'
import Layout from '@/components/Layout'

// 클라이언트 사이드에서만 로드
const RealtimeContent = dynamic(
  () => import('@/components/RealtimeContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function RealtimePage() {
  return (
    <Layout>
      <RealtimeContent />
    </Layout>
  )
}