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

export default function MatchingScoreChart({ data }: ChartProps) {
    // 성공/실패별 평균 점수 계산
    const successScores = data.merged
        .filter((d: any) => d.matching?.result === 1)
        .map((d: any) => d.matching.score)

    const failScores = data.merged
        .filter((d: any) => d.matching?.result === 0)
        .map((d: any) => d.matching.score)

    const avgSuccess = successScores.length > 0
        ? successScores.reduce((a: number, b: number) => a + b, 0) / successScores.length
        : 0

    const avgFail = failScores.length > 0
        ? failScores.reduce((a: number, b: number) => a + b, 0) / failScores.length
        : 0

    // 임계값 찾기
    const threshold = data.merged.find((d: any) => d.matching?.threshold)?.matching.threshold || 4100

    const chartData = {
        labels: ['성공', '실패'],
        datasets: [{
            label: '평균 매칭 점수',
            data: [avgSuccess, avgFail],
            backgroundColor: ['rgba(76, 175, 80, 0.7)', 'rgba(244, 67, 54, 0.7)'],
            borderColor: ['#4caf50', '#f44336'],
            borderWidth: 2
        }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 5000
            }
        },
        plugins: {
            annotation: {
                annotations: {
                    line1: {
                        type: 'line' as const,
                        yMin: threshold,
                        yMax: threshold,
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }
                }
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context: any) {
                        const label = context.label
                        const count = label === '성공' ? successScores.length : failScores.length
                        return `샘플 수: ${count}개\n임계값: ${threshold}`
                    }
                }
            }
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">📈 매칭 점수 분포</h2>
            <div className="h-80">
                <Bar data={chartData} options={options} />
            </div>
            <div className="mt-4 text-sm text-gray-600">
                <p>🔴 빨간 점선: 임계값 ({threshold})</p>
                <p>✅ 성공 평균: {avgSuccess.toFixed(0)}</p>
                <p>❌ 실패 평균: {avgFail.toFixed(0)}</p>
            </div>
        </div>
    )
}