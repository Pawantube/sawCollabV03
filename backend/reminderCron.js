// // reminderCron.js
// const Reminder = require("./models/reminderModel");

// const runReminderCron = (io) => {
//   setInterval(async () => {
//     const now = new Date();

//     const dueReminders = await Reminder.find({
//       isDone: false,
//       dueAt: { $lte: now },
//     })
//       .populate("user", "name _id")
//       .populate("chat", "users");

//     dueReminders.forEach((reminder) => {
//       const payload = {
//         _id: reminder._id,
//         message: reminder.message,
//         dueAt: reminder.dueAt,
//         type: reminder.type,
//         chatId: reminder.chat?._id,
//         userId: reminder.user._id,
//         createdBy: reminder.user.name,
//       };

//       if (reminder.type === "me") {
//         io.to(reminder.user._id.toString()).emit("reminderDue", payload);
//       } else if (reminder.type === "us") {
//         io.to(reminder.chat._id.toString()).emit("reminderDue", payload);
//       }
//     });
//   }, 60 * 1000); // runs every 60 seconds
// };

// module.exports = runReminderCron;
const Reminder = require("./models/reminderModel");

const runReminderCron = (io) => {
  setInterval(async () => {
    const now = new Date();

    const dueReminders = await Reminder.find({
      isDone: false,
      notificationSent: false,
      dueAt: { $lte: now },
    })
      .populate("user", "name _id")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "name _id",
        },
      });

    for (const reminder of dueReminders) {
      const payload = {
        _id: reminder._id,
        message: reminder.message,
        dueAt: reminder.dueAt,
        type: reminder.type,
        chatId: reminder.chat?._id,
        userId: reminder.user._id,
        createdBy: reminder.user.name,
      };

      try {
        if (reminder.type === "me") {
          // Private Reminder
          io.to(reminder.user._id.toString()).emit("reminderDue", payload);
        } else if (
          reminder.type === "us" &&
          reminder.chat &&
          Array.isArray(reminder.chat.users)
        ) {
          // Group Reminder – Emit to all group members
          reminder.chat.users.forEach((user) => {
            io.to(user._id.toString()).emit("reminderDue", payload);
          });
        }

        // Mark as notificationSent
        reminder.notificationSent = true;
        await reminder.save();
      } catch (err) {
        console.error(`Error processing reminder ${reminder._id}`, err);
      }
    }

    if (dueReminders.length > 0) {
      console.log(`[ReminderCron] Processed ${dueReminders.length} reminders at ${now.toLocaleString()}`);
    }
  }, 60 * 1000); // Run every minute
};

module.exports = runReminderCron;
