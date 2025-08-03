const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
