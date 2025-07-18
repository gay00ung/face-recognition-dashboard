'use client'

import { useEffect, useState } from 'react'
import RealtimeChart from '@/components/charts/RealtimeChart'
import FacePositionVisualizer from '@/components/FacePositionVisualizer'
import { supabase, LivenessHistoryDTO, MatchingHistoryDTO, SensorDataDTO, FaceCoordinateDTO } from '@/lib/supabase'

interface CombinedData {
  id: string
  liveness?: LivenessHistoryDTO
  matching?: MatchingHistoryDTO
  sensor?: SensorDataDTO
  faceCoordinate?: FaceCoordinateDTO
  timestamp: number
}

export default function RealtimeContent() {
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

    // 실시간 구독 설정
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
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">실시간 모니터링</h1>
        <p className="text-gray-600">ID 기반 통합 데이터 분석</p>
      </div>

      {/* 연결 상태 */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
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

      {/* 실시간 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <RealtimeChart data={livenessData} title="Liveness 추이" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <RealtimeChart data={matchingData} title="Matching 추이" />
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">얼굴 위치</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {combinedData.slice(0, 20).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm">
                    {item.liveness ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.liveness.result === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.liveness.result === 1 ? '성공' : '실패'} ({item.liveness.score})
                      </span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.matching ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.matching.result === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.matching.result === 1 ? '성공' : '실패'} ({item.matching.score}/{item.matching.th_score})
                      </span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {item.sensor ? (
                      <div className="space-y-2">
                        {/* 조도 정보 */}
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <div>
                              <span className="text-xs font-medium text-gray-700">조도</span>
                              <span className="ml-2 text-sm font-mono font-semibold text-gray-900">{item.sensor.ambient_light} lux</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 각도 정보 */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-700 mb-1">오일러 각도</div>
                              {(() => {
                                try {
                                  const angles = JSON.parse(item.sensor.euler_angles);
                                  if (Array.isArray(angles) && angles.length >= 3) {
                                    return (
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="relative group cursor-help">
                                          <span className="text-gray-700 font-medium">X:</span>
                                          <span className="font-mono ml-1 text-gray-900 font-semibold">{parseFloat(angles[0]).toFixed(1)}°</span>
                                          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                                            X: {angles[0]}°
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                          </div>
                                        </div>
                                        <div className="relative group cursor-help">
                                          <span className="text-gray-700 font-medium">Y:</span>
                                          <span className="font-mono ml-1 text-gray-900 font-semibold">{parseFloat(angles[1]).toFixed(1)}°</span>
                                          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                                            Y: {angles[1]}°
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                          </div>
                                        </div>
                                        <div className="relative group cursor-help">
                                          <span className="text-gray-700 font-medium">Z:</span>
                                          <span className="font-mono ml-1 text-gray-900 font-semibold">{parseFloat(angles[2]).toFixed(1)}°</span>
                                          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                                            Z: {angles[2]}°
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return <span className="text-xs text-gray-500">데이터 형식 오류</span>;
                                } catch (e) {
                                  return (
                                    <div 
                                      className="text-xs text-gray-600 truncate cursor-help" 
                                      title={item.sensor.euler_angles}
                                    >
                                      {item.sensor.euler_angles.substring(0, 30)}...
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {item.faceCoordinate ? (
                      <div className="flex gap-3">
                        <FacePositionVisualizer
                          bbox_x={item.faceCoordinate.bbox_x}
                          bbox_y={item.faceCoordinate.bbox_y}
                          bbox_w={item.faceCoordinate.bbox_w}
                          bbox_h={item.faceCoordinate.bbox_h}
                          yaw={item.faceCoordinate.yaw}
                          pitch={item.faceCoordinate.pitch}
                          roll={item.faceCoordinate.roll}
                        />
                        <div className="min-w-[140px] space-y-3">
                          {/* 각도 정보 */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              각도
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Yaw</span>
                                <span className="text-sm font-mono font-medium text-gray-900">
                                  {item.faceCoordinate.yaw !== null && item.faceCoordinate.yaw !== undefined ? `${Math.round(item.faceCoordinate.yaw)}°` : '-'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Pitch</span>
                                <span className="text-sm font-mono font-medium text-gray-900">
                                  {item.faceCoordinate.pitch !== null && item.faceCoordinate.pitch !== undefined ? `${Math.round(item.faceCoordinate.pitch)}°` : '-'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Roll</span>
                                <span className="text-sm font-mono font-medium text-gray-900">
                                  {item.faceCoordinate.roll !== null && item.faceCoordinate.roll !== undefined ? `${Math.round(item.faceCoordinate.roll)}°` : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 위치 정보 */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              위치
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">X</span>
                                <span className="text-xs font-mono font-medium text-gray-900">{item.faceCoordinate.bbox_x?.toFixed(0) || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Y</span>
                                <span className="text-xs font-mono font-medium text-gray-900">{item.faceCoordinate.bbox_y?.toFixed(0) || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">W</span>
                                <span className="text-xs font-mono font-medium text-gray-900">{item.faceCoordinate.bbox_w?.toFixed(0) || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">H</span>
                                <span className="text-xs font-mono font-medium text-gray-900">{item.faceCoordinate.bbox_h?.toFixed(0) || '-'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
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
  )
}