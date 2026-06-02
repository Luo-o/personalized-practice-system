const express = require("express");
const router = express.Router();

const {
  registerStudent,
  login,
  me,
  updateMyProfile,
  changePassword,
} = require("../controllers/auth.controller");

router.post("/register-student", registerStudent);
router.post("/login", login);
router.get("/me", me);
router.put("/update-profile", updateMyProfile);
router.put("/change-password", changePassword);

module.exports = router;
