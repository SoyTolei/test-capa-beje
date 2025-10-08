export type UserRole = "admin" | "instructor" | "student"
export type LessonType = "video" | "pdf" | "youtube"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  instructor_id?: string
  is_published: boolean
  created_at: string
  updated_at: string
  instructor?: Profile
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description?: string
  type: LessonType
  content_url?: string
  duration_minutes?: number
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface UserCourseProgress {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  last_accessed_at?: string
  completed_at?: string
}

export interface UserLessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
  last_position_seconds: number
  created_at: string
  updated_at: string
}

export interface CourseWithProgress extends Course {
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
  enrolled_at?: string
}
