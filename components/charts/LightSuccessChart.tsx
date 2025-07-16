'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ChartProps {
  data: any
}

export default function LightSuccessChart({ data }: ChartProps) {
  const lightBins = [
    { label: '매우어두움', min: 0, max: 50 },
    { label: '어두움', min: 50, max: 100 },
    { label: '보통', min: 100, max: 200 },
    { label: '밝음', min: 200, max: 300 },
    { label: '매우밝음', min: 300, max: 500 }
  ]
  
  // 조명별 성공률 계산
  const lightData = lightBins.map(bin => {
    const inBin = data.merged.filter((d: any) => {
      const light = parseFloat(d.sensor?.['Ambient Light'] || 0)
      return light >= bin.min && light < bin.max
    })
    
    const livenessSuccess = inBin.filter((d: any) => d.liveness?.result === 1).length
    const matchingSuccess = inBin.filter((d: any) => d.matching?.result === 1).length
    
    return {
      label: bin.label,
      livenessRate: inBin.length > 0 ? (livenessSuccess / inBin.length * 100) : 0,
      matchingRate: inBin.length > 0 ? (matchingSuccess / inBin.length * 100) : 0,
      count: inBin.length
    }
  })
  
  const chartData = {
    labels: lightData.map(d => d.label),
    datasets: [
      {
        label: 'Liveness 성공률',
        data: lightData.map(d => d.livenessRate),
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: '#2196f3',
        borderWidth: 2
      },
      {
        label: 'Matching 성공률',
        data: lightData.map(d => d.matchingRate),
        backgroundColor: 'rgba(255, 152, 0, 0.7)',
        borderColor: '#ff9800',
        borderWidth: 2
      }
    ]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const index = context.dataIndex
            return `샘플 수: ${lightData[index].count}개`
          }
        }
      }
    }
  }
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">📊 조명별 성공률</h2>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}