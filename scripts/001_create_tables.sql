-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');

-- Create enum for lesson types
CREATE TYPE lesson_type AS ENUM ('video', 'pdf', 'youtube');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create modules table (sections within a course)
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type lesson_type NOT NULL,
  content_url TEXT, -- For uploaded videos/PDFs or YouTube URLs
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_course_progress table
CREATE TABLE user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Create user_lesson_progress table
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_position_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_user_course_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course ON user_course_progress(course_id);
CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor')));
CREATE POLICY "Admins and instructors can create courses" ON courses FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor')));
CREATE POLICY "Admins and course instructors can update courses" ON courses FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR instructor_id = auth.uid());
CREATE POLICY "Admins can delete courses" ON courses FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- RLS Policies for modules
CREATE POLICY "Users can view modules of accessible courses" ON modules FOR SELECT USING (
  course_id IN (SELECT id FROM courses WHERE is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor')))
);
CREATE POLICY "Admins and instructors can manage modules" ON modules FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor')));

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons of accessible modules" ON lessons FOR SELECT USING (
  module_id IN (
    SELECT m.id FROM modules m
    JOIN courses c ON m.course_id = c.id
    WHERE c.is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor'))
  )
);
CREATE POLICY "Admins and instructors can manage lessons" ON lessons FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor')));

-- RLS Policies for user_course_progress
CREATE POLICY "Users can view own progress" ON user_course_progress FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor')));
CREATE POLICY "Users can insert own progress" ON user_course_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own progress" ON user_course_progress FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_lesson_progress
CREATE POLICY "Users can view own lesson progress" ON user_lesson_progress FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'instructor')));
CREATE POLICY "Users can manage own lesson progress" ON user_lesson_progress FOR ALL USING (user_id = auth.uid());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
