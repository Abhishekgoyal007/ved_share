import Feedback from '../models/feedback.model.js';

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
export const createFeedback = async (req, res) => {
  const { type, message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const feedback = await Feedback.create({
    user: req.user._id,
    type,
    message,
  });

  res.status(201).json(feedback);
};

// @desc    Get all feedbacks (Admin only)
// @route   GET /api/feedback
// @access  Admin
export const getAllFeedbacks = async (req, res) => {
  const feedbacks = await Feedback.find().populate('user', 'name email');
  res.json(feedbacks);
};

// @desc    Delete feedback (Admin only)
// @route   DELETE /api/feedback/:id
// @access  Admin
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};