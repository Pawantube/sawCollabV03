const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const {
  createReminder,
  getRemindersForUser,
  markAsDone,
  rescheduleReminder,
  deleteReminder,
  getRemindersForChat,
  getPublicReminders,
  markReminderAsSent,
  toggleReminderDone,
} = require("../controllers/reminderController");


// Create a new reminder
router.post("/", protect, createReminder);

// Get all reminders for logged-in user
router.get("/user", protect, getRemindersForUser);

// Get all group reminders for a specific chat
router.get("/chat/:chatId", protect, getRemindersForChat);

router.get("/public", protect, getPublicReminders);
// Mark a reminder as donea
router.put("/:id/done", protect, markAsDone);

router.put("/:id/mark-sent", protect, markReminderAsSent);//new

// Reschedule a reminder
router.put("/:id/reschedule", protect, rescheduleReminder);
router.put("/:id/toggle-done", protect, toggleReminderDone);

// Delete a reminder
router.delete("/:id", protect, deleteReminder);

router.put("/:id/done", protect, toggleReminderDone);


module.exports = router
