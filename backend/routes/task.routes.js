const express = require("express");
const {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  deleteSingleFile,
  getStats,
  markTaskCompleted,
} = require("../controllers/task.controller");
const { authMiddleware } = require("../middlewares/auth");
const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllTasks);
router.get("/stats", getStats);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id/complete", markTaskCompleted);
router.delete("/:id", deleteTask);
router.delete("/:id/files/:fileId", deleteSingleFile);

module.exports = router;
