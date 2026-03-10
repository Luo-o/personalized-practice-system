PRAGMA foreign_keys = ON;

DELETE FROM answer_records;
DELETE FROM submissions;
DELETE FROM exam_questions;
DELETE FROM exams;
DELETE FROM question_images;
DELETE FROM question_knowledge_points;
DELETE FROM question_options;
DELETE FROM questions;
DELETE FROM class_students;
DELETE FROM classes;
DELETE FROM knowledge_points;
DELETE FROM chapters;
DELETE FROM subjects;
DELETE FROM users;
DELETE FROM students;
DELETE FROM teachers;

INSERT INTO teachers (id, teacher_no, name, gender, phone, email, title, department)
VALUES
  (1, 'T001', '李老师', '女', '13800000001', 'teacher1@example.com', '讲师', '计算机学院'),
  (2, 'T002', '王老师', '男', '13800000002', 'teacher2@example.com', '副教授', '计算机学院');

INSERT INTO students (id, student_no, name, gender, phone, email, major, grade, class_name)
VALUES
  (1, 'S001', '张三', '男', '13900000001', 'student1@example.com', '软件工程', '2022', '软件1班'),
  (2, 'S002', '李四', '女', '13900000002', 'student2@example.com', '软件工程', '2022', '软件1班'),
  (3, 'S003', '王五', '男', '13900000003', 'student3@example.com', '计算机科学与技术', '2022', '计科2班');

INSERT INTO users (username, password_hash, role, profile_id, status)
VALUES
  ('teacher1', '123456', 'teacher', 1, 'active'),
  ('teacher2', '123456', 'teacher', 2, 'active'),
  ('student1', '123456', 'student', 1, 'active'),
  ('student2', '123456', 'student', 2, 'active'),
  ('student3', '123456', 'student', 3, 'active');

INSERT INTO subjects (id, name)
VALUES
  (1, '计算机网络'),
  (2, 'Python'),
  (3, '数据结构');

INSERT INTO chapters (id, subject_id, name, sort_order)
VALUES
  ('1-1', 1, '第1章 计算机网络体系结构', 1),
  ('1-2', 1, '第2章 物理层', 2),
  ('1-3', 1, '第3章 数据链路层', 3),
  ('1-4', 1, '第4章 网络层', 4),
  ('1-5', 1, '第5章 传输层', 5),
  ('1-6', 1, '第6章 应用层', 6),

  ('2-1', 2, '第1章 Python基础', 1),
  ('2-2', 2, '第2章 流程控制', 2),
  ('2-3', 2, '第3章 函数', 3),

  ('3-1', 3, '第1章 线性表', 1),
  ('3-2', 3, '第2章 栈和队列', 2),
  ('3-3', 3, '第3章 树', 3);

INSERT INTO knowledge_points (chapter_id, name, sort_order)
VALUES
  ('1-1', '网络的分层结构', 1),
  ('1-1', 'OSI参考模型', 2),
  ('1-1', 'TCP/IP模型', 3),
  ('1-4', 'IP协议', 1),
  ('1-4', '路由选择', 2),
  ('1-5', 'TCP', 1),
  ('1-5', 'UDP', 2),
  ('1-6', 'HTTP', 1),
  ('1-6', 'DNS', 2),

  ('2-1', '变量', 1),
  ('2-1', '数据类型', 2),
  ('2-2', '条件语句', 1),
  ('2-2', '循环语句', 2),
  ('2-3', '函数定义', 1),
  ('2-3', '参数传递', 2),

  ('3-1', '顺序表', 1),
  ('3-1', '链表', 2),
  ('3-2', '栈', 1),
  ('3-2', '队列', 2),
  ('3-3', '二叉树', 1);

INSERT INTO classes (id, name, teacher_id, subject_id, description)
VALUES
  (1, '软件工程1班-计算机网络', 1, 1, '2022级软件工程专业计算机网络课程班级'),
  (2, '软件工程1班-Python', 1, 2, '2022级软件工程专业Python课程班级'),
  (3, '计科2班-数据结构', 2, 3, '2022级计算机科学与技术专业数据结构课程班级');

INSERT INTO class_students (class_id, student_id)
VALUES
  (1, 1),
  (1, 2),
  (2, 1),
  (2, 2),
  (3, 3);

INSERT INTO questions (
  id, owner_type, teacher_id, title, subject_id, chapter_id,
  difficulty, source, is_real, analysis, correct_answer
)
VALUES
  (101, 'system', NULL, 'TCP 属于哪一层协议？', 1, '1-5', '简单', '自建', 0, 'TCP 属于传输层协议。', 'B'),
  (102, 'teacher', 1, 'Python 中定义函数使用哪个关键字？', 2, '2-3', '简单', '教师录入', 0, 'Python 使用 def 定义函数。', 'A');

INSERT INTO question_options (question_id, option_key, option_text, sort_order)
VALUES
  (101, 'A', '网络层', 1),
  (101, 'B', '传输层', 2),
  (101, 'C', '应用层', 3),
  (101, 'D', '数据链路层', 4),

  (102, 'A', 'def', 1),
  (102, 'B', 'function', 2),
  (102, 'C', 'fun', 3),
  (102, 'D', 'define', 4);

INSERT INTO exams (
  id, title, class_id, teacher_id, subject_id,
  publish_at, deadline_at, status, duration_minutes, total_score
)
VALUES
  (201, '计算机网络第一章测验', 1, 1, 1, '2026-03-01 10:00:00', '2026-03-15 23:59:59', 'published', 30, 2),
  (202, 'Python函数基础测验', 2, 1, 2, '2026-03-02 10:00:00', '2026-03-16 23:59:59', 'draft', 20, 1);

INSERT INTO exams (
  id, title, class_id, teacher_id, subject_id,
  publish_at, deadline_at, status, duration_minutes, total_score
)
VALUES
  (201, '计算机网络第一章测验', 1, 1, 1, '2026-03-01 10:00:00', '2026-03-15 23:59:59', 'published', 30, 2),
  (202, 'Python函数基础测验', 2, 1, 2, '2026-03-02 10:00:00', '2026-03-16 23:59:59', 'draft', 20, 1);

