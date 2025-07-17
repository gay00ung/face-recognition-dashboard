'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface RealtimeChartProps {
  data: any[]
  title: string
}

export default function RealtimeChart({ data, title }: RealtimeChartProps) {
  // 최근 20개 데이터만 표시
  const recentData = data.slice(0, 20).reverse()
  
  const chartData = {
    labels: recentData.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: '성공률',
        data: recentData.map(item => item.result === 1 ? 100 : 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: '점수',
        data: recentData.map(item => (item.score / 50)), // 스케일 조정
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      }
    ]
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    animation: {
      duration: 750
    }
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}