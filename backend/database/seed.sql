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

INSERT INTO exam_questions (exam_id, question_id, sort_order, score)
VALUES
  (201, 101, 1, 2),
  (202, 102, 1, 1);

  INSERT INTO questions (
  id, owner_type, teacher_id, title, subject_id, chapter_id,
  difficulty, source, is_real, analysis, correct_answer
)
VALUES
  (103, 'system', NULL, 'OSI 七层模型中负责端到端通信的是哪一层？', 1, '1-1', '简单', '自建', 0, 'OSI模型中负责端到端通信的是传输层。', 'C'),

  (104, 'system', NULL, 'IP 地址主要用于标识什么？', 1, '1-4', '简单', '自建', 0, 'IP地址用于标识网络中的主机。', 'B'),

  (105, 'system', NULL, 'UDP 协议的特点是？', 1, '1-5', '简单', '自建', 0, 'UDP是无连接协议，不保证可靠传输。', 'A'),

  (106, 'system', NULL, 'HTTP 协议默认使用哪个端口？', 1, '1-6', '简单', '自建', 0, 'HTTP 默认端口为80。', 'B'),

  (107, 'system', NULL, 'DNS 协议的主要作用是什么？', 1, '1-6', '简单', '自建', 0, 'DNS用于将域名解析为IP地址。', 'D'),

  (108, 'system', NULL, 'TCP 三次握手的第一次握手发送什么标志位？', 1, '1-5', '中等', '自建', 0, '第一次握手客户端发送 SYN。', 'A'),

  (109, 'system', NULL, 'IP 协议属于哪一层？', 1, '1-4', '简单', '自建', 0, 'IP属于网络层协议。', 'B'),

  (110, 'system', NULL, '数据链路层的主要功能是什么？', 1, '1-3', '中等', '自建', 0, '数据链路层负责帧的传输、差错检测等。', 'C');

  INSERT INTO question_options (question_id, option_key, option_text, sort_order)
VALUES

-- 103
(103,'A','物理层',1),
(103,'B','网络层',2),
(103,'C','传输层',3),
(103,'D','应用层',4),

-- 104
(104,'A','路由器',1),
(104,'B','主机',2),
(104,'C','交换机',3),
(104,'D','端口',4),

-- 105
(105,'A','无连接、不可靠',1),
(105,'B','面向连接',2),
(105,'C','保证可靠传输',3),
(105,'D','必须建立连接',4),

-- 106
(106,'A','21',1),
(106,'B','80',2),
(106,'C','443',3),
(106,'D','25',4),

-- 107
(107,'A','传输数据',1),
(107,'B','建立连接',2),
(107,'C','加密通信',3),
(107,'D','域名解析',4),

-- 108
(108,'A','SYN',1),
(108,'B','ACK',2),
(108,'C','FIN',3),
(108,'D','RST',4),

-- 109
(109,'A','传输层',1),
(109,'B','网络层',2),
(109,'C','应用层',3),
(109,'D','数据链路层',4),

-- 110
(110,'A','地址分配',1),
(110,'B','端口管理',2),
(110,'C','帧传输与差错检测',3),
(110,'D','域名解析',4);