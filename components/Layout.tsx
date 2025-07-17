'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 사이드바 */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 border-r border-gray-200`}>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className={`font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${sidebarOpen ? 'block' : 'hidden'}`}>
                            Face Analytics
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                    </div>
                </div>

                <nav className="mt-4 px-2">
                    <Link href="/" className="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
                        <span className="text-2xl">📊</span>
                        {sidebarOpen && <span className="ml-3 font-medium">대시보드</span>}
                    </Link>
                    <Link href="/upload" className="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
                        <span className="text-2xl">📁</span>
                        {sidebarOpen && <span className="ml-3 font-medium">파일 업로드</span>}
                    </Link>
                    <Link href="/realtime" className="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
                        <span className="text-2xl">🔴</span>
                        {sidebarOpen && <span className="ml-3 font-medium">실시간 모니터링</span>}
                    </Link>
                    <Link href="/reports" className="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
                        <span className="text-2xl">📄</span>
                        {sidebarOpen && <span className="ml-3 font-medium">리포트</span>}
                    </Link>
                </nav>
            </aside>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 overflow-auto bg-gray-50">
                <div className="px-8 py-6 lg:px-12 lg:py-8">
                    {children}
                </div>
            </main>
        </div>
    )
}