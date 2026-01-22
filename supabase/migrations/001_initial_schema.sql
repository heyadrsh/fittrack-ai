-- FitTrack AI - Initial Database Schema
-- Run with: supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Stores user profile and authentication data
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin_hash TEXT NOT NULL,
  weight_kg DECIMAL(5,2),
  height_cm INTEGER,
  age INTEGER,
  goal TEXT DEFAULT 'body_recomposition',
  activity_level TEXT DEFAULT 'moderate',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'User profiles with authentication and basic metrics';

-- ============================================
-- FOOD LOGS TABLE
-- Stores individual food entries
-- ============================================
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  fiber_g DECIMAL(6,2),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  is_preset BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, logged_at);
COMMENT ON TABLE food_logs IS 'Daily food intake logs with nutrition data';

-- ============================================
-- FOOD PRESETS TABLE
-- Saved meal presets for quick logging
-- ============================================
CREATE TABLE food_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2)
);

CREATE INDEX idx_food_presets_user ON food_presets(user_id);
COMMENT ON TABLE food_presets IS 'Saved meal presets for quick food logging';

-- ============================================
-- WORKOUT PLANS TABLE
-- Weekly workout schedule templates
-- ============================================
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  name TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX idx_workout_plans_user_day ON workout_plans(user_id, day_of_week);
COMMENT ON TABLE workout_plans IS 'Weekly workout templates with exercises';

-- ============================================
-- WORKOUT LOGS TABLE
-- Completed workout records
-- ============================================
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  exercises JSONB NOT NULL DEFAULT '[]',
  duration_minutes INTEGER,
  total_volume DECIMAL(10,2),
  notes TEXT
);

CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, completed_at);
COMMENT ON TABLE workout_logs IS 'Completed workout sessions with actual performance';

-- ============================================
-- EXERCISES TABLE
-- Exercise library/database
-- ============================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  youtube_video_id TEXT,
  instructions TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

CREATE INDEX idx_exercises_muscle ON exercises(muscle_group);
COMMENT ON TABLE exercises IS 'Exercise library with form videos and instructions';

-- ============================================
-- BODY METRICS TABLE
-- Body measurements and composition
-- ============================================
CREATE TABLE body_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  weight_kg DECIMAL(5,2),
  body_fat_percent DECIMAL(4,1),
  waist_cm DECIMAL(5,1),
  chest_cm DECIMAL(5,1),
  arm_cm DECIMAL(5,1),
  thigh_cm DECIMAL(5,1),
  neck_cm DECIMAL(5,1)
);

CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, logged_at);
COMMENT ON TABLE body_metrics IS 'Body measurements and composition tracking';

-- ============================================
-- PROGRESS PHOTOS TABLE
-- Body progress photos with AI analysis
-- ============================================
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  photo_url TEXT,
  pose_type TEXT CHECK (pose_type IN ('front', 'side', 'back')),
  ai_analysis TEXT
);

CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_id, uploaded_at);
COMMENT ON TABLE progress_photos IS 'Progress photos with optional AI body analysis';

-- ============================================
-- WATER LOGS TABLE
-- Daily water intake tracking
-- ============================================
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  amount_ml INTEGER NOT NULL
);

CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, logged_at);
COMMENT ON TABLE water_logs IS 'Water intake logs in milliliters';

-- ============================================
-- SUPPLEMENT LOGS TABLE
-- Supplement tracking
-- ============================================
CREATE TABLE supplement_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  supplement_name TEXT NOT NULL,
  taken BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_supplement_logs_user_date ON supplement_logs(user_id, logged_at);
COMMENT ON TABLE supplement_logs IS 'Daily supplement intake tracking';

-- ============================================
-- SLEEP LOGS TABLE
-- Sleep tracking for recovery
-- ============================================
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  hours_slept DECIMAL(3,1),
  quality INTEGER CHECK (quality BETWEEN 1 AND 5)
);

CREATE INDEX idx_sleep_logs_user_date ON sleep_logs(user_id, logged_at);
COMMENT ON TABLE sleep_logs IS 'Sleep duration and quality tracking';

-- ============================================
-- USER STATS TABLE
-- Gamification: XP, levels, badges, streaks
-- ============================================
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  workout_streak INTEGER DEFAULT 0,
  logging_streak INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  last_workout_date DATE,
  last_log_date DATE
);

CREATE INDEX idx_user_stats_user ON user_stats(user_id);
COMMENT ON TABLE user_stats IS 'Gamification stats: XP, levels, badges, streaks';

-- ============================================
-- PERSONAL RECORDS TABLE
-- Track PRs for each exercise
-- ============================================
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  reps INTEGER,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personal_records_user_exercise ON personal_records(user_id, exercise_id);
COMMENT ON TABLE personal_records IS 'Personal record tracking for exercises';

-- ============================================
-- CREATE DEFAULT USER
-- For single-user app with PIN 0007
-- ============================================
INSERT INTO users (id, pin_hash, weight_kg, height_cm, age, goal, activity_level)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '0007', -- In production, this should be hashed
  67.7,
  168,
  23,
  'body_recomposition',
  'moderate'
);

-- Create user_stats entry for default user
INSERT INTO user_stats (user_id)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
