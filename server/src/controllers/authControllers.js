const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels.js");
const mongoose = require("mongoose");
require("dotenv").config();

const secret = process.env.JWT_SECRET;
const allowedRoles = ["Superadmin", "Admin", "Superuser", "User"];
const saltRounds = 12; // Increased security for bcrypt

// Helper function to validate MongoDB Object ID
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Register User
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const usersCount = await User.countDocuments();
    const role = usersCount === 0 ? "Superadmin" : "User";

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, secret, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secret, {
      expiresIn: "1h",
    });

    return res.json({ token, role: user.role, id: user._id });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Check if token is valid
exports.check_auth = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    return res.status(200).json({ message: "Token is valid", user: decoded });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get current user profile
exports.me = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ email: user.email, role: user.role });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Superadmin: Get all users with pagination and sorting
exports.getAllUsers = async (req, res) => {
  try {
    const {
      _start = 0,
      _end = 10,
      _sort = "createdAt",
      _order = "desc",
    } = req.query;

    const users = await User.find()
      .skip(parseInt(_start))
      .limit(parseInt(_end) - parseInt(_start))
      .sort({ [_sort]: _order });

    const total = await User.countDocuments();

    return res.json({ data: users, total });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Superadmin: Create a user
exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ email, password: hashedPassword, role: "User" });
    await user.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating User:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Superadmin: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res
      .status(200)
      .json({ message: "User role updated successfully", role: user.role });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Superadmin: Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: Create a Superuser
exports.createSuperuser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only Admin can create a Superuser." });
    }

    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const superuser = new User({
      email,
      password: hashedPassword,
      role: "Superuser",
      createdBy: req.user._id,
    });

    await superuser.save();

    return res.status(201).json({ message: "Superuser created successfully" });
  } catch (error) {
    console.error("Error creating Superuser:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get users created by the admin with pagination
exports.getUsersByAdmin = async (req, res) => {
  try {
    const {
      _start = 0,
      _end = 10,
      _sort = "createdAt",
      _order = "desc",
    } = req.query;

    const users = await User.find({ createdBy: req.user._id })
      .skip(parseInt(_start))
      .limit(parseInt(_end) - parseInt(_start))
      .sort({ [_sort]: _order });

    const total = await User.countDocuments({ createdBy: req.user._id });

    return res.status(200).json({ data: users, total });
  } catch (error) {
    console.error("Error fetching users created by Admin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update role of a user created by admin
exports.updateRoleByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["User", "Superuser"].includes(role)) {
      return res.status(400).json({
        message:
          'Invalid role. Admin can only update to "User" or "Superuser".',
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const user = await User.findOne({ _id: id, createdBy: req.user._id });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or you don't have permission." });
    }

    user.role = role;
    await user.save();

    return res
      .status(200)
      .json({ message: "User role updated successfully", role: user.role });
  } catch (error) {
    console.error("Error updating user role by Admin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
