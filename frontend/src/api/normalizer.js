// export function normalizeQuestion(q) {
//   return {
//     id: q.id,
//     title: q.title,
//     difficulty: q.difficulty,
//     subjectId: q.subject_id,
//     chapterId: q.chapter_id,
//     correct: q.correct_answer,
//     analysis: q.analysis,
//     options: q.options || [],
//   };
// }

// export function normalizeExam(e) {
//   return {
//     id: e.id,
//     title: e.title,
//     classId: e.class_id,
//     subjectId: e.subject_id,
//     teacherId: e.teacher_id,
//     publishAt: e.publish_at,
//     deadlineAt: e.deadline_at,
//     status: e.status,
//     duration: e.duration_minutes,
//     totalScore: e.total_score,
//     questionCount: e.question_count,
//   };
// }

export function normalizeExam(e) {
  return {
    id: e.id,
    title: e.title,
    classId: e.class_id,
    subjectId: e.subject_id,
    teacherId: e.teacher_id,
    publishAt: e.publish_at,
    deadlineAt: e.deadline_at,
    status: e.status,
    duration: e.duration_minutes,
    totalScore: e.total_score,
    questionCount: e.question_count,
    className: e.class_name,
    teacherName: e.teacher_name,
    subjectName: e.subject_name,
    submissionCount: e.submission_count,
  };
}

export function normalizeClass(c) {
  return {
    id: c.id,
    name: c.name,
    teacherId: c.teacher_id,
    subjectId: c.subject_id,
    teacherName: c.teacher_name,
    subjectName: c.subject_name,
    studentCount: c.student_count,
  };
}

export function normalizeSubject(s) {
  return {
    id: s.id,
    name: s.name,
    createdAt: s.created_at,
  };
}

export function normalizeChapter(c) {
  return {
    id: c.id,
    subjectId: c.subject_id,
    name: c.name,
    sortOrder: c.sort_order,
    createdAt: c.created_at,
  };
}

export function normalizeQuestion(q) {
  return {
    id: q.id,
    ownerType: q.owner_type,
    teacherId: q.teacher_id,
    teacherName: q.teacher_name,
    title: q.title,
    subjectId: q.subject_id,
    subjectName: q.subject_name,
    chapterId: q.chapter_id,
    chapterName: q.chapter_name,
    difficulty: q.difficulty,
    source: q.source,
    isReal: Number(q.is_real || 0),
    analysis: q.analysis,
    correct: q.correct_answer,
    createdAt: q.created_at,
    updatedAt: q.updated_at,

    options: (q.options || []).map((item) => ({
      key: item.option_key,
      text: item.option_text,
      sortOrder: item.sort_order,
    })),

    knowledgePoints: (q.knowledgePoints || []).map((kp) => ({
      id: kp.id,
      name: kp.name,
    })),

    images: (q.images || []).map((img) => ({
      imageUrl: img.image_url,
      sortOrder: img.sort_order,
    })),
  };
}
