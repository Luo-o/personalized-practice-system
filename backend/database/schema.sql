PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS answer_records;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS exam_questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS question_images;
DROP TABLE IF EXISTS question_knowledge_points;
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS class_students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS knowledge_points;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  student_no TEXT UNIQUE,
  name TEXT NOT NULL,
  gender TEXT,
  phone TEXT,
  email TEXT,
  major TEXT,
  grade TEXT,
  class_name TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teachers (
  id INTEGER PRIMARY KEY,
  teacher_no TEXT UNIQUE,
  name TEXT NOT NULL,
  gender TEXT,
  phone TEXT,
  email TEXT,
  title TEXT,
  department TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  profile_id INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  subject_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE knowledge_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE TABLE classes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id INTEGER NOT NULL,
  subject_id INTEGER,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE class_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (class_id, student_id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('system', 'teacher')),
  teacher_id INTEGER,
  title TEXT NOT NULL,
  subject_id INTEGER NOT NULL,
  chapter_id TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('简单', '中等', '困难')),
  source TEXT,
  is_real INTEGER NOT NULL DEFAULT 0,
  analysis TEXT,
  correct_answer TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE TABLE question_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_key TEXT NOT NULL,
  option_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE question_knowledge_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  knowledge_point_id INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id),
  UNIQUE (question_id, knowledge_point_id)
);

CREATE TABLE question_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE exams (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  class_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  publish_at DATETIME,
  deadline_at DATETIME,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'closed')),
  duration_minutes INTEGER,
  total_score INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE exam_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE (exam_id, question_id)
);

CREATE TABLE submissions (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'exam' CHECK (type IN ('exam', 'practice')),
  exam_id INTEGER,
  student_id INTEGER NOT NULL,
  class_id INTEGER,
  title TEXT,
  subject_id INTEGER NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  score REAL NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  duration_min INTEGER,
  submitted_at DATETIME NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  UNIQUE (exam_id, student_id)
);

CREATE TABLE answer_records (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL,
  exam_id INTEGER,
  student_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_answer TEXT,
  correct_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  answered_at DATETIME NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS wrong_book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  wrong_count INTEGER NOT NULL DEFAULT 1,
  last_wrong_at DATETIME,
  last_practice_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, question_id)
);

CREATE TABLE practice_sessions (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  strategy TEXT,
  total_count INTEGER NOT NULL DEFAULT 0,
  config_json TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE practice_session_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  score_snapshot REAL,
  FOREIGN KEY (practice_id) REFERENCES practice_sessions(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE (practice_id, question_id)
);