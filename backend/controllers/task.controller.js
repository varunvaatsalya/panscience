const Task = require("../models/task.model");
const User = require("../models/user.model");
const { deleteFile } = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.createTask = async (req, res) => {
  try {
    let { title, description, dueDate, priority, assignedTo, documents } =
      req.body;

    if (assignedTo.length === 0) {
      if (req.user.role === "admin")
        res.status(400).json({
          success: false,
          message: "Assign this task atleast one user.",
          task,
        });
      else {
        assignedTo = [req.user.id];
      }
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      documents,
      createdRole: req.user.role,
      createdBy: req.user.role === "admin" ? null : req.user.id,
    });

    res
      .status(201)
      .json({ success: true, message: "Task created successfully.", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: "Task creation failed" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalTasks, pendingTasks, completedTasks] =
      await Promise.all([
        User.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({ status: "pending" }),
        Task.countDocuments({ status: "completed" }),
      ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        pendingTasks,
        completedTasks,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const {
      page = 1,
      status = "",
      priority = "",
      dueDateOrder = "asc",
      limit = 10,
    } = req.query;

    // const limit = 10;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};

    if (req.user.role !== "admin") {
      filter.$or = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];
    }

    if (status !== "") filter.status = status;
    if (priority !== "") filter.priority = priority;

    const sort = {};
    if (dueDateOrder === "asc") sort.dueDate = 1;
    else if (dueDateOrder === "desc") sort.dueDate = -1;

    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const total = await Task.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({ success: true, tasks, totalPages });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate("assignedTo", "_id name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task updated successfully.",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.markTaskCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    await Task.findByIdAndUpdate(id, { status: "completed" });

    res.json({ success: true, message: "Task marked as completed" });
  } catch (error) {
    console.error("Error marking task completed:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  for (let doc of task.documents) {
    if (doc.publicId) await deleteFile(doc.publicId);
  }
  await task.deleteOne();
  res.json({ message: "Task & files deleted" });
};

exports.deleteSingleFile = async (req, res) => {
  const task = await Task.findById(req.params.id);
  const file = task.documents.id(req.params.fileId);
  if (file?.publicId) await deleteFile(file.publicId);
  file.remove();
  await task.save();
  res.json({ message: "File deleted" });
};
