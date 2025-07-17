'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import RealtimeChart from '@/components/charts/RealtimeChart'
import { supabase, LivenessHistoryDTO, MatchingHistoryDTO, SensorDataDTO, FaceCoordinateDTO } from '@/lib/supabase'

interface CombinedData {
    id: string
    liveness?: LivenessHistoryDTO
    matching?: MatchingHistoryDTO
    sensor?: SensorDataDTO
    faceCoordinate?: FaceCoordinateDTO
    timestamp: number
}

export default function RealtimePage() {
    const [livenessData, setLivenessData] = useState<LivenessHistoryDTO[]>([])
    const [matchingData, setMatchingData] = useState<MatchingHistoryDTO[]>([])
    const [sensorData, setSensorData] = useState<SensorDataDTO[]>([])
    const [faceCoordinateData, setFaceCoordinateData] = useState<FaceCoordinateDTO[]>([])
    const [combinedData, setCombinedData] = useState<CombinedData[]>([])
    const [isConnected, setIsConnected] = useState(false)

    // ID별로 데이터 결합
    const combineDataById = () => {
        const dataMap: { [key: string]: CombinedData } = {}

        // 모든 데이터를 ID로 그룹화
        livenessData.forEach(item => {
            if (!dataMap[item.id]) {
                dataMap[item.id] = { id: item.id, timestamp: item.created_at }
            }
            dataMap[item.id].liveness = item
        })

        matchingData.forEach(item => {
            if (!dataMap[item.id]) {
                dataMap[item.id] = { id: item.id, timestamp: item.created_at }
            }
            dataMap[item.id].matching = item
        })

        sensorData.forEach(item => {
            if (!dataMap[item.id]) {
                dataMap[item.id] = { id: item.id, timestamp: item.created_at }
            }
            dataMap[item.id].sensor = item
        })

        faceCoordinateData.forEach(item => {
            if (!dataMap[item.transaction_id]) {
                dataMap[item.transaction_id] = { id: item.transaction_id, timestamp: item.created_at }
            }
            dataMap[item.transaction_id].faceCoordinate = item
        })

        // 배열로 변환하고 시간순 정렬
        const combined = Object.values(dataMap)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50) // 최근 50개만

        setCombinedData(combined)
    }

    useEffect(() => {
        combineDataById()
    }, [livenessData, matchingData, sensorData, faceCoordinateData])

    useEffect(() => {
        // 초기 데이터 로드
        fetchInitialData()

        // 실시간 구독 설정 (기존 코드와 동일)
        const channel = supabase
            .channel('realtime-face-recognition')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'liveness_history' },
                (payload) => {
                    setLivenessData(prev => [payload.new as LivenessHistoryDTO, ...prev].slice(0, 100))
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'matching_history' },
                (payload) => {
                    setMatchingData(prev => [payload.new as MatchingHistoryDTO, ...prev].slice(0, 100))
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_data' },
                (payload) => {
                    setSensorData(prev => [payload.new as SensorDataDTO, ...prev].slice(0, 100))
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'face_coordinates' },
                (payload) => {
                    setFaceCoordinateData(prev => [payload.new as FaceCoordinateDTO, ...prev].slice(0, 100))
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED')
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchInitialData = async () => {
        // 최근 100개 데이터 가져오기
        const [liveness, matching, sensor, face] = await Promise.all([
            supabase.from('liveness_history').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('matching_history').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('sensor_data').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('face_coordinates').select('*').order('created_at', { ascending: false }).limit(100)
        ])

        if (liveness.data) setLivenessData(liveness.data)
        if (matching.data) setMatchingData(matching.data)
        if (sensor.data) setSensorData(sensor.data)
        if (face.data) setFaceCoordinateData(face.data)
    }

    // 통계 계산
    const calculateStats = () => {
        const stats = {
            livenessSuccessWithSensor: combinedData.filter(d =>
                d.liveness?.result === 1 && d.sensor
            ),
            livenessFailWithSensor: combinedData.filter(d =>
                d.liveness?.result === 0 && d.sensor
            ),
            matchingFailAfterLivenessSuccess: combinedData.filter(d =>
                d.liveness?.result === 1 && d.matching?.result === 0
            ),
            completeSuccess: combinedData.filter(d =>
                d.liveness?.result === 1 && d.matching?.result === 1
            )
        }

        return stats
    }

    const stats = calculateStats()

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">실시간 모니터링</h1>
                    <p className="text-gray-600">ID 기반 통합 데이터 분석</p>
                </div>

                {/* 연결 상태 */}
                <div className="mb-6">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                        {isConnected ? '실시간 연결됨' : '연결 중...'}
                    </div>
                </div>

                {/* 통합 분석 통계 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Liveness 성공 시 센서 데이터</h3>
                        <div className="text-2xl font-bold text-green-600">{stats.livenessSuccessWithSensor.length}건</div>
                        {stats.livenessSuccessWithSensor.length > 0 && (
                            <div className="text-xs text-gray-500 mt-2">
                                평균 조도: {(stats.livenessSuccessWithSensor
                                    .reduce((acc, d) => acc + parseFloat(d.sensor?.ambient_light || '0'), 0) /
                                    stats.livenessSuccessWithSensor.length).toFixed(1)} lux
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Liveness 실패 시 센서 데이터</h3>
                        <div className="text-2xl font-bold text-red-600">{stats.livenessFailWithSensor.length}건</div>
                        {stats.livenessFailWithSensor.length > 0 && (
                            <div className="text-xs text-gray-500 mt-2">
                                평균 조도: {(stats.livenessFailWithSensor
                                    .reduce((acc, d) => acc + parseFloat(d.sensor?.ambient_light || '0'), 0) /
                                    stats.livenessFailWithSensor.length).toFixed(1)} lux
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Liveness 성공 → Matching 실패</h3>
                        <div className="text-2xl font-bold text-orange-600">{stats.matchingFailAfterLivenessSuccess.length}건</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">완전 성공</h3>
                        <div className="text-2xl font-bold text-blue-600">{stats.completeSuccess.length}건</div>
                    </div>
                </div>

                {/* ID별 통합 데이터 테이블 */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">최근 인증 시도 상세</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Liveness</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Matching</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">센서 데이터</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">얼굴 좌표</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">시간</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {combinedData.slice(0, 20).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.id.slice(0, 8)}...</td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.liveness ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.liveness.result === 1
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.liveness.result === 1 ? '성공' : '실패'} ({item.liveness.score})
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.matching ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.matching.result === 1
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.matching.result === 1 ? '성공' : '실패'} ({item.matching.score}/{item.matching.th_score})
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.sensor ? (
                                                <div>
                                                    <div className="font-medium text-gray-900">조도: {item.sensor.ambient_light} lux</div>
                                                    <div className="text-xs text-gray-600 mt-0.5">각도: {item.sensor.euler_angles.slice(0, 20)}...</div>
                                                </div>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.faceCoordinate ? (
                                                <div className="text-gray-900">
                                                    <div>Yaw: {item.faceCoordinate.yaw?.toFixed(1)}°</div>
                                                    <div>Pitch: {item.faceCoordinate.pitch?.toFixed(1)}°</div>
                                                </div>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}