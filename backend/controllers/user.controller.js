const taskModel = require("../models/task.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, query = "", taskCount = 0 } = req.query;
    const limit = 10;
    const skip = (Number(page) - 1) * limit;

    const searchFilter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

    let users = await User.find(searchFilter)
      .select("-password")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalUsers / limit);

    if (taskCount == "1") {
      const userIds = users.map((u) => u._id);

      const taskCounts = await taskModel.aggregate([
        { $match: { assignedTo: { $in: userIds } } },
        { $unwind: "$assignedTo" },
        { $match: { assignedTo: { $in: userIds } } },
        {
          $group: {
            _id: "$assignedTo",
            count: { $sum: 1 },
          },
        },
      ]);

      const taskMap = {};
      taskCounts.forEach((item) => {
        taskMap[item._id.toString()] = item.count;
      });

      users = users.map((user) => ({
        ...user.toObject(),
        taskCount: taskMap[user._id.toString()] || 0,
      }));
    }

    res.json({ success: true, users, totalPages });
  } catch (error) {
    console.error("Get users failed:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json(user);
};

exports.createUser = async (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ user, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.params.id;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.name = name || user.name;
    user.email = email || user.email;

    if (password && password.length >= 6) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }
    await user.save();
    res.json({ success: true,user, message: "User updated successfully" });
  } catch (error) {
    console.error("Update user failed:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
