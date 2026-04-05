const {
  getAllClasses,
  getClassById,
  getStudentsByClassId,
  getClassesByStudentId,
  getClassesByTeacherId,
  createClass,
  addStudentToClass,
  removeStudentFromClass,
  joinClassByCode,
  quitClass,
} = require("../models/class.model");

async function listClasses(req, res) {
  try {
    const classes = await getAllClasses();
    return res.json({
      message: "获取班级列表成功",
      data: classes,
    });
  } catch (error) {
    console.error("获取班级列表失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getClassDetail(req, res) {
  try {
    const { id } = req.params;
    const classInfo = await getClassById(id);

    if (!classInfo) {
      return res.status(404).json({
        message: "班级不存在",
      });
    }

    return res.json({
      message: "获取班级详情成功",
      data: classInfo,
    });
  } catch (error) {
    console.error("获取班级详情失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getClassStudents(req, res) {
  try {
    const { id } = req.params;
    const classInfo = await getClassById(id);

    if (!classInfo) {
      return res.status(404).json({
        message: "班级不存在",
      });
    }

    const students = await getStudentsByClassId(id);

    return res.json({
      message: "获取班级学生成功",
      data: {
        classInfo,
        students,
      },
    });
  } catch (error) {
    console.error("获取班级学生失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getStudentClasses(req, res) {
  try {
    const { id } = req.params;
    const classes = await getClassesByStudentId(id);

    return res.json({
      message: "获取学生班级成功",
      data: classes,
    });
  } catch (error) {
    console.error("获取学生班级失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function getTeacherClasses(req, res) {
  try {
    const { id } = req.params;
    const classes = await getClassesByTeacherId(id);

    return res.json({
      message: "获取教师班级成功",
      data: classes,
    });
  } catch (error) {
    console.error("获取教师班级失败:", error);
    return res.status(500).json({
      message: "服务器内部错误",
      error: error.message,
    });
  }
}

async function createClassHandler(req, res) {
  try {
    const {
      id,
      name,
      teacher_id,
      teacherId,
      subject_id,
      subjectId,
      description,
      desc,
    } = req.body || {};

    const finalTeacherId = teacher_id ?? teacherId;
    const finalSubjectId = subject_id ?? subjectId;
    const finalDescription = description ?? desc ?? "";

    if (!name || !finalTeacherId || !finalSubjectId) {
      return res.status(400).json({
        message: "缺少必要字段",
      });
    }

    const result = await createClass({
      id,
      name: String(name).trim(),
      teacher_id: Number(finalTeacherId),
      subject_id: Number(finalSubjectId),
      description: String(finalDescription || "").trim(),
    });

    const classInfo = await getClassById(result.id);

    return res.status(201).json({
      message: "创建班级成功",
      data: {
        ...result,
        classInfo,
      },
    });
  } catch (error) {
    console.error("创建班级失败:", error);
    return res.status(400).json({
      message: error.message || "创建班级失败",
    });
  }
}

async function addStudentToClassHandler(req, res) {
  try {
    const { id } = req.params;
    const { student_id, studentId } = req.body || {};
    const finalStudentId = student_id ?? studentId;

    if (!id || !finalStudentId) {
      return res.status(400).json({
        message: "缺少班级ID或学生ID",
      });
    }

    const result = await addStudentToClass({
      classId: Number(id),
      studentId: Number(finalStudentId),
    });

    const students = await getStudentsByClassId(id);

    return res.json({
      message: "添加学生成功",
      data: {
        ...result,
        students,
      },
    });
  } catch (error) {
    console.error("添加学生失败:", error);
    return res.status(400).json({
      message: error.message || "添加学生失败",
    });
  }
}

async function removeStudentFromClassHandler(req, res) {
  try {
    const { id, studentId } = req.params;

    if (!id || !studentId) {
      return res.status(400).json({
        message: "缺少班级ID或学生ID",
      });
    }

    await removeStudentFromClass({
      classId: Number(id),
      studentId: Number(studentId),
    });

    const students = await getStudentsByClassId(id);

    return res.json({
      message: "移除学生成功",
      data: {
        success: true,
        students,
      },
    });
  } catch (error) {
    console.error("移除学生失败:", error);
    return res.status(400).json({
      message: error.message || "移除学生失败",
    });
  }
}

async function joinClassHandler(req, res) {
  try {
    const { class_code, student_id } = req.body || {};

    if (!class_code || !student_id) {
      return res.status(400).json({
        message: "缺少课程号或学生ID",
      });
    }

    const classInfo = await joinClassByCode({
      classCode: class_code.trim(),
      studentId: Number(student_id),
    });

    return res.json({
      message: "加入班级成功",
      data: classInfo,
    });
  } catch (error) {
    console.error("加入班级失败:", error);
    return res.status(400).json({
      message: error.message || "加入班级失败",
    });
  }
}

async function quitClassHandler(req, res) {
  try {
    const { id } = req.params;
    const { student_id } = req.body || {};

    if (!id || !student_id) {
      return res.status(400).json({
        message: "缺少班级ID或学生ID",
      });
    }

    await quitClass({
      classId: Number(id),
      studentId: Number(student_id),
    });

    return res.json({
      message: "退出班级成功",
      data: true,
    });
  } catch (error) {
    console.error("退出班级失败:", error);
    return res.status(400).json({
      message: error.message || "退出班级失败",
    });
  }
}

module.exports = {
  listClasses,
  getClassDetail,
  getClassStudents,
  getStudentClasses,
  getTeacherClasses,
  createClassHandler,
  addStudentToClassHandler,
  removeStudentFromClassHandler,
  joinClassHandler,
  quitClassHandler,
};
