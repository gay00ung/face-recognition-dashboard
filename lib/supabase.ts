import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface LivenessHistoryDTO {
  id: string
  result: number
  score: number
  created_at: number
  response_time: number
  has_image: boolean
  has_thumbnail: boolean
  image_metadata?: string | null
  device_info?: string | null
  app_version: string
}

export interface MatchingHistoryDTO {
  id: string
  result: number
  score: number
  th_score: number
  message: string
  created_at: number
  response_time: number
  has_image: boolean
  image_metadata?: string | null
  device_info?: string | null
  app_version: string
}

export interface SensorDataDTO {
  id: string
  raw_rotation_vector: string
  corrected_quaternion: string
  euler_angles: string
  ground_angles: string
  ambient_light: string
  device_info?: string | null
  created_at: number
}

export interface FaceCoordinateDTO {
  id: string
  transaction_id: string
  coordinates: string
  bbox_x?: number | null
  bbox_y?: number | null
  bbox_w?: number | null
  bbox_h?: number | null
  yaw?: number | null
  pitch?: number | null
  roll?: number | null
  created_at: number
}