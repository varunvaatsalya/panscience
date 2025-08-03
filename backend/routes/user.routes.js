const express = require("express");
const {
  getAllUsers, getUser, createUser, updateUser, deleteUser
} = require("../controllers/user.controller");
const { authMiddleware, isAdmin } = require("../middlewares/auth");
const router = express.Router();

router.use(authMiddleware);

router.get("/", isAdmin, getAllUsers);
router.get("/:id", getUser);
router.post("/", isAdmin, createUser);
router.put("/:id", updateUser);
router.delete("/:id", isAdmin, deleteUser);

module.exports = router;
