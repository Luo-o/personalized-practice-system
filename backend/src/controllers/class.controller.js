const {
  getAllClasses,
  getClassById,
  getStudentsByClassId,
  getClassesByStudentId,
  getClassesByTeacherId,
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

module.exports = {
  listClasses,
  getClassDetail,
  getClassStudents,
  getStudentClasses,
  getTeacherClasses,
};
