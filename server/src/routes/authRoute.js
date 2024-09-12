const express = require("express");
const {
  register,
  login,
  createAdmin,
  getAllUsers,
  createSuperuser,
  createUser,
  getUsersByAdmin,
  updateUserRole,
  check_auth,
  me,
  deleteUser,
  updateRoleByAdmin,
} = require("../controllers/authControllers.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const router = express.Router();

// Public routes
router.post("/register", register); // Registration route
router.post("/login", login); // Login route
router.get("/check-auth", check_auth); // Check auth token validity

// Protected routes
router.get("/me", me); // Get current user profile (protected route)

// Superadmin routes
router.get("/users", authMiddleware("Superadmin"), getAllUsers); // Fetch all users with pagination and sorting
router.put("/users/:id", authMiddleware("Superadmin"), updateUserRole); // Update user role by ID
router.delete("/users/:id", authMiddleware("Superadmin"), deleteUser); // Delete a user
router.post("/create-user", authMiddleware("Superadmin"), createUser); // Create a user

// Admin routes
router.post("/create-superuser", authMiddleware("Admin"), createSuperuser);
router.get("/my-users", authMiddleware("Admin"), getUsersByAdmin); // Fetch users specific to the admin
router.put("/my-users/:id", authMiddleware("Admin"), updateRoleByAdmin);
// User routes
// router.get("/profile", authMiddleware("User"), getProfile); // Fetch profile for a specific user

module.exports = router;
