interface AnalysisData {
    liveness: any[]
    matching: any[]
    sensor: any[]
    processTime: any[]
    merged: any[]
}

export function parseCSVLine(line: string): string[] {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    values.push(current.trim())

    return values.map(v => v.replace(/^"|"$/g, ''))
}

export async function parseIntegratedCSV(content: string, fileName: string): Promise<Partial<AnalysisData>> {
    const lines = content.split('\n')

    const data: Partial<AnalysisData> = {
        liveness: [],
        matching: [],
        sensor: [],
        processTime: []
    }

    let currentSection: keyof AnalysisData | null = null
    const sectionData: Record<string, string[]> = {
        liveness: [],
        matching: [],
        sensor: [],
        processTime: []
    }

    // 각 섹션 찾기
    lines.forEach(line => {
        if (line.includes('Table: Liveness History')) {
            currentSection = 'liveness'
        } else if (line.includes('Table: Matching History')) {
            currentSection = 'matching'
        } else if (line.includes('Table: Sensor Data')) {
            currentSection = 'sensor'
        } else if (line.includes('Table: Process Time Logs')) {
            currentSection = 'processTime'
        } else if (currentSection && line.trim() && !line.includes('Table:')) {
            sectionData[currentSection].push(line)
        }
    })

    // 각 섹션 파싱
    Object.entries(sectionData).forEach(([type, lines]) => {
        if (lines.length > 1) {
            const headers = parseCSVLine(lines[0])

            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i])
                if (values.length === headers.length) {
                    const row: any = { _sourceFile: fileName }
                    headers.forEach((header, index) => {
                        row[header] = values[index]
                    })
                    data[type as keyof AnalysisData]?.push(row)
                }
            }
        }
    })

    console.log(`파일 처리 완료: ${fileName}`)
    console.log(`- Liveness: ${data.liveness?.length}건`)
    console.log(`- Matching: ${data.matching?.length}건`)
    console.log(`- Sensor: ${data.sensor?.length}건`)
    console.log(`- Process Time: ${data.processTime?.length}건`)

    return data
}

export function mergeAnalysisData(allData: Partial<AnalysisData>[]): AnalysisData {
    const merged: AnalysisData = {
        liveness: [],
        matching: [],
        sensor: [],
        processTime: [],
        merged: []
    }

    // 모든 파일의 데이터 합치기
    allData.forEach(data => {
        merged.liveness.push(...(data.liveness || []))
        merged.matching.push(...(data.matching || []))
        merged.sensor.push(...(data.sensor || []))
        merged.processTime.push(...(data.processTime || []))
    })

    // ID별로 데이터 병합
    const mergedById: Record<string, any> = {}

    // Liveness 데이터 처리
    merged.liveness.forEach(row => {
        const id = row.ID
        if (!mergedById[id]) mergedById[id] = {}
        mergedById[id].liveness = {
            result: parseInt(row.Result) === 1 ? 1 : 0,
            score: parseFloat(row.Score)
        }
    })

    // Matching 데이터 처리
    merged.matching.forEach(row => {
        const id = row.ID
        if (!mergedById[id]) mergedById[id] = {}
        mergedById[id].matching = {
            result: parseInt(row.Result) === 1 ? 1 : 0,
            score: parseFloat(row.Score),
            threshold: parseFloat(row['Threshold Score'])
        }
    })

    // Sensor 데이터 처리
    merged.sensor.forEach(row => {
        const id = row.ID
        if (!mergedById[id]) mergedById[id] = {}

        // Euler Angles 파싱
        if (row['Euler Angles (X,Y,Z)']) {
            const angles = row['Euler Angles (X,Y,Z)'].split(',').map((v: string) => parseFloat(v.trim()))
            mergedById[id].sensor = {
                eulerX: angles[0] || 0,
                eulerY: angles[1] || 0,
                eulerZ: angles[2] || 0,
                ambientLight: parseFloat(row['Ambient Light']) || 0
            }
        }
    })

    // Process Time 데이터 처리
    merged.processTime.forEach(row => {
        const id = row['Transaction ID'] || row.ID
        if (!mergedById[id]) mergedById[id] = {}

        if (!mergedById[id].processes) mergedById[id].processes = {}

        const processName = row['Process Name']
        mergedById[id].processes[processName] = {
            duration: parseInt(row['Duration (ms)']) || 0
        }
    })

    // 배열로 변환
    merged.merged = Object.entries(mergedById).map(([id, data]) => ({
        id,
        ...data
    }))

    return merged
}