'use client'

import React from 'react'

interface FacePositionVisualizerProps {
  bbox_x?: number | null
  bbox_y?: number | null
  bbox_w?: number | null
  bbox_h?: number | null
  yaw?: number | null
  pitch?: number | null
  roll?: number | null
}

export default function FacePositionVisualizer({
  bbox_x,
  bbox_y,
  bbox_w,
  bbox_h,
  yaw,
  pitch,
  roll
}: FacePositionVisualizerProps) {
  // 모바일 세로 비율에 맞게 조정 (9:16 비율)
  const viewportWidth = 150
  const viewportHeight = 267
  
  // bbox 값 처리
  const hasValidBbox = bbox_x !== null && bbox_x !== undefined && 
                       bbox_y !== null && bbox_y !== undefined && 
                       bbox_w !== null && bbox_w !== undefined && 
                       bbox_h !== null && bbox_h !== undefined
  
  
  // 기본값 설정
  let faceX = viewportWidth / 2
  let faceY = viewportHeight / 2
  let faceWidth = 40
  let faceHeight = 40
  
  if (hasValidBbox) {
    // bbox 값이 픽셀 단위인지 정규화된 값인지 확인
    const maxValue = Math.max(bbox_x, bbox_y, bbox_x + bbox_w, bbox_y + bbox_h)
    
    if (maxValue > 1) {
      // 픽셀 값인 경우 - 실제 데이터 기준으로 화면 크기 추정
      // 여유를 두고 조금 더 큰 값으로 설정 (모바일 세로 모드)
      const assumedWidth = 720   // 실제 최대값 561보다 여유있게
      const assumedHeight = 1280  // 실제 최대값 881보다 여유있게
      
      // bbox의 좌상단 좌표와 크기를 viewport에 맞게 변환
      faceX = (bbox_x / assumedWidth) * viewportWidth
      faceY = (bbox_y / assumedHeight) * viewportHeight
      faceWidth = (bbox_w / assumedWidth) * viewportWidth
      faceHeight = (bbox_h / assumedHeight) * viewportHeight
      
    } else {
      // 0-1 정규화된 값인 경우
      faceX = bbox_x * viewportWidth
      faceY = bbox_y * viewportHeight
      faceWidth = bbox_w * viewportWidth
      faceHeight = bbox_h * viewportHeight
    }
  }
  
  // 얼굴 중심점 계산
  const centerX = faceX + faceWidth / 2
  const centerY = faceY + faceHeight / 2
  const faceRadius = Math.min(faceWidth, faceHeight) / 2
  
  // 각도를 라디안으로 변환
  const yawRad = ((yaw || 0) * Math.PI) / 180
  const pitchRad = ((pitch || 0) * Math.PI) / 180
  const rollRad = ((roll || 0) * Math.PI) / 180
  
  // Yaw에 따른 눈의 위치 조정 (얼굴 크기에 비례)
  const eyeOffsetX = faceRadius * 0.43
  const eyeOffsetY = faceRadius * -0.29
  const eyeRadius = faceRadius * 0.11
  
  // 왼쪽 눈
  const leftEyeX = centerX - eyeOffsetX + (Math.sin(yawRad) * faceRadius * 0.3)
  const leftEyeY = centerY + eyeOffsetY + (Math.sin(pitchRad) * faceRadius * 0.3)
  
  // 오른쪽 눈
  const rightEyeX = centerX + eyeOffsetX + (Math.sin(yawRad) * faceRadius * 0.3)
  const rightEyeY = centerY + eyeOffsetY + (Math.sin(pitchRad) * faceRadius * 0.3)
  
  // 눈동자 위치 (시선 방향)
  const pupilOffset = eyeRadius * 0.5
  const leftPupilX = leftEyeX + Math.sin(yawRad) * pupilOffset
  const leftPupilY = leftEyeY - Math.sin(pitchRad) * pupilOffset
  const rightPupilX = rightEyeX + Math.sin(yawRad) * pupilOffset
  const rightPupilY = rightEyeY - Math.sin(pitchRad) * pupilOffset
  
  // 코 위치
  const noseX = centerX + (Math.sin(yawRad) * faceRadius * 0.4)
  const noseY = centerY + (Math.sin(pitchRad) * faceRadius * 0.15)
  
  // 입 위치
  const mouthY = centerY + faceRadius * 0.43 + (Math.sin(pitchRad) * faceRadius * 0.3)
  const mouthStartX = centerX - faceRadius * 0.43 + (Math.sin(yawRad) * faceRadius * 0.3)
  const mouthEndX = centerX + faceRadius * 0.43 + (Math.sin(yawRad) * faceRadius * 0.3)
  
  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <svg 
        width={viewportWidth} 
        height={viewportHeight} 
        className="border border-gray-300 rounded bg-white"
      >
        {/* 배경 */}
        <rect width="100%" height="100%" fill="white" />
        
        {/* 그리드 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* 중심선 */}
        <line 
          x1={viewportWidth / 2} 
          y1="0" 
          x2={viewportWidth / 2} 
          y2={viewportHeight} 
          stroke="#e5e7eb" 
          strokeWidth="0.5" 
          strokeDasharray="2,2"
        />
        <line 
          x1="0" 
          y1={viewportHeight / 2} 
          x2={viewportWidth} 
          y2={viewportHeight / 2} 
          stroke="#e5e7eb" 
          strokeWidth="0.5" 
          strokeDasharray="2,2"
        />
        
        {/* bbox 영역 표시 (실제 감지된 얼굴 영역) */}
        {hasValidBbox && (
          <rect
            x={faceX}
            y={faceY}
            width={faceWidth}
            height={faceHeight}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        )}
        
        {/* 얼굴 회전 변환 그룹 */}
        <g transform={`translate(${centerX}, ${centerY}) rotate(${roll || 0}) translate(${-centerX}, ${-centerY})`}>
          {/* 얼굴 윤곽 (타원형으로 변경) */}
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={faceRadius * (1 - Math.abs(Math.sin(yawRad)) * 0.3)}
            ry={faceRadius}
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          
          {/* 왼쪽 눈 */}
          <ellipse
            cx={leftEyeX}
            cy={leftEyeY}
            rx={eyeRadius * (1 - Math.abs(Math.sin(yawRad)) * 0.5)}
            ry={eyeRadius}
            fill="white"
            stroke="#374151"
            strokeWidth="1"
          />
          
          {/* 오른쪽 눈 */}
          <ellipse
            cx={rightEyeX}
            cy={rightEyeY}
            rx={eyeRadius * (1 - Math.abs(Math.sin(yawRad)) * 0.5)}
            ry={eyeRadius}
            fill="white"
            stroke="#374151"
            strokeWidth="1"
          />
          
          {/* 왼쪽 눈동자 */}
          <circle
            cx={leftPupilX}
            cy={leftPupilY}
            r={eyeRadius * 0.5}
            fill="#374151"
          />
          
          {/* 오른쪽 눈동자 */}
          <circle
            cx={rightPupilX}
            cy={rightPupilY}
            r={eyeRadius * 0.5}
            fill="#374151"
          />
          
          {/* 코 */}
          <path
            d={`M ${noseX} ${noseY - faceRadius * 0.15} L ${noseX - faceRadius * 0.1} ${noseY + faceRadius * 0.1} L ${noseX + faceRadius * 0.1} ${noseY + faceRadius * 0.1}`}
            fill="none"
            stroke="#374151"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 입 */}
          <path
            d={`M ${mouthStartX} ${mouthY} Q ${centerX + Math.sin(yawRad) * faceRadius * 0.3} ${mouthY + faceRadius * 0.15} ${mouthEndX} ${mouthY}`}
            fill="none"
            stroke="#374151"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
        
        {/* 방향 표시 화살표 (작게, 하단에) */}
        <g opacity="0.7">
          {/* Yaw 화살표 (좌우) - 빨간색 */}
          <line
            x1={30}
            y1={viewportHeight - 15}
            x2={30 + Math.sin(yawRad) * 20}
            y2={viewportHeight - 15}
            stroke="#ef4444"
            strokeWidth="2"
            markerEnd="url(#arrowRed)"
          />
          <text x="5" y={viewportHeight - 12} fontSize="9" fill="#ef4444">Yaw</text>
          
          {/* Pitch 화살표 (상하) - 초록색 */}
          <line
            x1={80}
            y1={viewportHeight - 15}
            x2={80}
            y2={viewportHeight - 15 - Math.sin(pitchRad) * 20}
            stroke="#10b981"
            strokeWidth="2"
            markerEnd="url(#arrowGreen)"
          />
          <text x="90" y={viewportHeight - 12} fontSize="9" fill="#10b981">Pitch</text>
        </g>
        
        {/* 화살표 마커 정의 */}
        <defs>
          <marker
            id="arrowRed"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
          <marker
            id="arrowGreen"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}