const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { generateToken } = require("../config/jwt");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format", success: false });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        success: false,
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'user' or 'admin'",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already in use", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Server error during registration", success: false });
  }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({
      message: "Role must be either 'admin' or 'user'",
      success: false,
    });
  }

  if (role === "admin") {
    if (
      email !== process.env.DEFAULT_ADMIN_EMAIL ||
      password !== process.env.DEFAULT_ADMIN_PASSWORD
    ) {
      return res
        .status(401)
        .json({ message: "Invalid admin credentials", success: false });
    }
    const userResponse = {
      id: "0",
      name: "admin",
      email: email,
      role: role,
    };

    const token = generateToken(userResponse);

    return res
      .cookie("sessionToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: userResponse,
        message: "Admin login successful",
        success: true,
      });
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ message: "Invalid credentials", success: false });
  }

  const userResponse = {
    id: user._id,
    name: user.name,
    email,
    role,
  };

  const token = generateToken(userResponse);

  res
    .cookie("sessionToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    })
    .json({
      user: userResponse,
      message: "User login successful",
      success: true,
    });
};
