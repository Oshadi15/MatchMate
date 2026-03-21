const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../../controllers/userManagement/userController");

// test route
router.get("/test", (req, res) => {
  res.json({ message: "User routes working!" });
});

// register
router.post("/register", registerUser);

// login
router.post("/login", loginUser);

module.exports = router;