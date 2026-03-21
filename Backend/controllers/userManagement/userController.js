const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/userManagement/userModel");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { userId: id, role: role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =========================
// Register User
// =========================
const registerUser = async (req, res) => {
  try {
    const {
      itNumber,
      name,
      contactNumber,
      email,
      year,
      faculty,
      password,
    } = req.body;

    // validation
    if (
      !itNumber ||
      !name ||
      !contactNumber ||
      !email ||
      !year ||
      !faculty ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // check email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // check IT number
    const existingIT = await User.findOne({ itNumber });
    if (existingIT) {
      return res.status(400).json({
        message: "IT number already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      itNumber,
      name,
      contactNumber,
      email,
      year,
      faculty,
      password: hashedPassword,
      role: "student",
    });

    return res.status(201).json({
      message: "Registration successful",
      _id: user._id,
      itNumber: user.itNumber,
      name: user.name,
      contactNumber: user.contactNumber,
      email: user.email,
      year: user.year,
      faculty: user.faculty,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// =========================
// Login User
// =========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      _id: user._id,
      itNumber: user.itNumber,
      name: user.name,
      contactNumber: user.contactNumber,
      email: user.email,
      year: user.year,
      faculty: user.faculty,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};