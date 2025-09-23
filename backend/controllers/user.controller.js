// controllers/user.controller.js
import User from "../models/user.model.js";

// GET /api/users - Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// PATCH /api/users/:id/role - Change user role
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  
  if (req.user._id.toString() === id) {
    return res.status(403).json({ message: "You cannot change your own role" });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role", error: err.message });
  }
};

// DELETE /api/users/:id - Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};
