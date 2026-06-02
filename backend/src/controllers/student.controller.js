const {
  getWrongQuestionsByStudentId,
  getAnswerRecordsByStudentId,
  updateWrongQuestionStatusById,
  searchStudentsByKeyword,
  batchCreateStudents,
  batchAddStudentsToClass,
} = require("../models/student.model");

// 获取错题本
async function getWrongQuestions(req, res) {
  try {
    const { id } = req.params;

    const data = await getWrongQuestionsByStudentId(id);

    return res.json({
      message: "获取错题本成功",
      data,
    });
  } catch (error) {
    console.error("获取错题本失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

// 获取学生全部答题记录
async function getStudentAnswerRecords(req, res) {
  try {
    const { id } = req.params;

    const data = await getAnswerRecordsByStudentId(id);

    return res.json({
      message: "获取学生答题记录成功",
      data,
    });
  } catch (error) {
    console.error("获取学生答题记录失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

// 更新状态（已掌握）
async function updateWrongQuestionStatus(req, res) {
  try {
    const { studentId, questionId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "缺少 status",
      });
    }

    await updateWrongQuestionStatusById(studentId, questionId, status);

    return res.json({
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新错题状态失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

async function searchStudents(req, res) {
  try {
    const keyword = String(req.query.keyword || "").trim();

    if (!keyword) {
      return res.status(400).json({
        message: "请输入学生学号或姓名",
      });
    }

    const data = await searchStudentsByKeyword(keyword);

    return res.json({
      message: "搜索学生成功",
      data,
    });
  } catch (error) {
    console.error("搜索学生失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

async function batchCreateStudentAccounts(req, res) {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || !students.length) {
      return res.status(400).json({
        message: "学生数据不能为空",
      });
    }

    const result = await batchCreateStudents(students);

    return res.json({
      message: "批量创建学生完成",
      ...result,
    });
  } catch (error) {
    console.error("批量创建学生失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

async function batchAddStudentsToClassController(req, res) {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body;

    if (!classId) {
      return res.status(400).json({
        message: "缺少班级ID",
      });
    }

    if (!Array.isArray(studentIds) || !studentIds.length) {
      return res.status(400).json({
        message: "请选择要添加的学生",
      });
    }

    const result = await batchAddStudentsToClass(classId, studentIds);

    return res.json({
      message: "批量添加学生成功",
      ...result,
    });
  } catch (error) {
    console.error("批量添加学生到班级失败:", error);
    return res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
}

module.exports = {
  getWrongQuestions,
  getStudentAnswerRecords,
  updateWrongQuestionStatus,

  searchStudents,
  batchCreateStudentAccounts,
  batchAddStudentsToClassController,
};
