//new added 
/*This model supports:

Private & Group Reminders (type)

Tracking who marked done

Scheduled timestamps for polling
const mongoose = require("mongoose");
*/

/*
Great question! All the enhancements you've mentioned should be added directly to your MongoDB schema in your reminderModel.js file.

Here's how and where you add them:

🔧 Updated reminderSchema with Suggested Enhancements
Open your models/reminderModel.js file, and modify the schema like this:

js
Copy
Edit


const reminderSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["me", "us"], // 'me' = private, 'us' = group
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    title: {
      type: String,
      default: "", // Optional title (e.g. "Team Meeting")
    },
    message: {
      type: String,
      required: true,
    },
    dueAt: {
      type: Date,
      required: true,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    doneBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remindAgainCount: {
      type: Number,
      default: 0, // Number of times user hit "Remind me later"
    },
    notificationSent: {
      type: Boolean,
      default: false, // Mark true when backend has sent notification
    },
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);
module.exports = Reminder;
🔍 Why This Helps:
Field	Purpose
title	Short heading for UI display (optional, helps in long messages)
remindAgainCount	For tracking how often users postpone reminders
notificationSent	Useful for cron job systems / push notification logic

⚙ Where to Use These:
remindAgainCount → Increment this in the backend whenever user clicks "Remind Me Later".

notificationSent → Set to true once your backend cron job (or service worker) sends a notification.

title → Use in the UI as a header, and let users optionally fill it during reminder creation.

If you'd like, I can also show how to:

Update existing reminders with remindAgainCount++

Update your reminder creation API to support title

Would you like that?
*/ 
// const mongoose = require("mongoose");
// const reminderSchema = mongoose.Schema(
//   {
//     type: {
//       type: String,
//       enum: ["me", "us"], // 'me' = private, 'us' = group
//       required: true,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true, // creator
//     },
//     chat: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Chat",
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true, // reminder content
//     },
//     dueAt: {
//       type: Date,
//       required: true,
//     },
//     isDone: {
//       type: Boolean,
//       default: false,
//     },
//     doneBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// const Reminder = mongoose.model("Reminder", reminderSchema);
// module.exports = Reminder;

// const mongoose = require("mongoose");

// const reminderSchema = mongoose.Schema(
//   {
//     type: {
//       type: String,
//       enum: ["me", "us"], // 'me' = private, 'us' = group
//       required: true,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true, // creator
//     },
//     chat: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Chat",
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true, // reminder content
//     },
//     dueAt: {
//       type: Date,
//       required: true,
//     },

//     // ✅ NEW FIELDS START HERE
//     notificationSent: {
//       type: Boolean,
//       default: false, // Will be set true after first notification
//     },
//     remindAgainCount: {
//       type: Number,
//       default: 0, // Increases every time user snoozes
//     },

//     // ✅ Already present fields
//     isDone: {
//       type: Boolean,
//       default: false,
//     },
//     doneBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// const Reminder = mongoose.model("Reminder", reminderSchema);
// module.exports = Reminder;
//abhi
// 
// const mongoose = require("mongoose");

// const reminderSchema = mongoose.Schema(
//   {
//     message: { type: String, required: true },
//     dueAt: { type: Date, required: true },
//     type: { type: String, enum: ["me", "us"], required: true },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     chat: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Chat",
//       required: function () {
//         return this.type === "us"; // only required for public/group reminders
//       },
//     },
//     isDone: { type: Boolean, default: false },
//     remindAgainCount: { type: Number, default: 0 },
//     notificationSent: { type: Boolean, default: false },
//     title: { type: String },
//   },
//   { timestamps: true }
// );

// // 👇 Export the model
// const Reminder = mongoose.model("Reminder", reminderSchema);
// module.exports = Reminder;
// // 



const mongoose = require("mongoose");

const reminderSchema = mongoose.Schema(
  {
    message: { type: String, required: true },
    title: { type: String },
    dueAt: { type: Date, required: true },

    type: { type: String, enum: ["me", "us"], required: true }, // "me" = personal, "us" = group
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // creator
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: function () {
        return this.type === "us"; // only for group reminders
      },
    },

    // Tracking logic
    isDone: { type: Boolean, default: false }, // global done (legacy)
    markedDoneBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // new

    remindAgainCount: { type: Number, default: 0 },
    notificationSent: { type: Boolean, default: false },

    // New: individual snooze support
    snoozedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        until: { type: Date }
      }
    ]
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);
module.exports = Reminder;
