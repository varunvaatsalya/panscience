const Task = require("../models/task.model");
const { deleteFile } = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo, documents } =
      req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      documents,
      createdBy: req.user.id,
      createdRole: req.user.role,
    });

    res
      .status(201)
      .json({ success: true, message: "Task created successfully.", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: "Task creation failed" });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const {
      page = 1,
      status = "",
      priority = "",
      dueDateOrder = "asc",
    } = req.query;

    const limit = 10;
    const skip = (Number(page) - 1) * limit;

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
      .limit(limit)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const total = await Task.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

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
