const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const runReminderCron = require("./reminderCron");

const Reminder = require("./models/reminderModel");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// ROUTES
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/reminders", reminderRoutes);

// STATIC FILES FOR DEPLOYMENT
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

// SERVER LISTEN
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}...`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      "https://pawan-saw.netlify.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("✅ Socket connected");

  // Setup user socket
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join a specific chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined chat:", room);
  });

  // Join multiple chats (e.g., after login)
  socket.on("joinChats", (chatIds) => {
    chatIds.forEach((id) => socket.join(id));
    console.log("User joined chats:", chatIds);
  });

  // Typing notifications
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Send new message to other users in the chat
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat?.users) return console.log("❌ chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return; // Don't emit to sender
      socket.in(user._id).emit("message recieved", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("❌ User disconnected");
    socket.leave(socket.id);
  });
});

// CRON TO CHECK REMINDERS & EMIT
runReminderCron(io);



// // const express = require("express");
// // const connectDB = require("./config/db");
// // const dotenv = require("dotenv");
// // dotenv.config();

// // const userRoutes = require("./routes/userRoutes");
// // const chatRoutes = require("./routes/chatRoutes");
// // const messageRoutes = require("./routes/messageRoutes");
// // const reminderRoutes = require("./routes/reminderRoutes");
// // const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// // const path = require("path");
// // console.log(process.env.PORT)

// // connectDB();
// // const app = express();

// // app.use(express.json()); // to accept json data

// // // app.get("/", (req, res) => {
// // //   res.send("API Running!");
// // // });

// // app.use("/api/user", userRoutes);
// // app.use("/api/chat", chatRoutes);
// // app.use("/api/message", messageRoutes);
// // app.use("/api/reminders", reminderRoutes);

// // // --------------------------deployment------------------------------

// // const __dirname1 = path.resolve();

// // if (process.env.NODE_ENV === "production") {
// //   app.use(express.static(path.join(__dirname1, "/frontend/build")));

// //   app.get("*", (req, res) =>
// //     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
// //   );
// // } else {
// //   app.get("/", (req, res) => {
// //     res.send("API is running..");
// //   });
// // }

// // // --------------------------deployment------------------------------

// // // Error Handling middlewares
// // app.use(notFound);
// // app.use(errorHandler);

// // const PORT = process.env.PORT;

// // const server = app.listen(
// //   PORT,
// //   console.log(`Server running on PORT ${PORT}...`.yellow.bold)
// // );

// // const io = require("socket.io")(server, {
// //   pingTimeout: 60000,
// //   cors: {
// //     origin: "http://localhost:3000",
// //     // credentials: true,
// //   },
// // });

// // io.on("connection", (socket) => {
// //   console.log("Connected to socket.io");
// //   socket.on("setup", (userData) => {
// //     socket.join(userData._id);
	
// //     socket.emit("connected");
// //   });

// //   socket.on("join chat", (room) => {
// //     socket.join(room);
// //     console.log("User Joined Room: " + room);
// //   });
// //   socket.on("typing", (room) => socket.in(room).emit("typing"));
// //   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

// //   socket.on("new message", (newMessageRecieved) => {
// //     var chat = newMessageRecieved.chat;

// //     if (!chat.users) return console.log("chat.users not defined");

// //     chat.users.forEach((user) => {
// //       if (user._id == newMessageRecieved.sender._id) return;

// //       socket.in(user._id).emit("message recieved", newMessageRecieved);
// //     });
// //   });

// //   socket.off("setup", () => {
// //     console.log("USER DISCONNECTED");
// //     socket.leave(userData._id);
// //   });
// // });
// // yha tak basic hai
// const express = require("express");
// const connectDB = require("./config/db");
// const dotenv = require("dotenv");
// dotenv.config();
// const runReminderCron = require("./reminderCron");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const reminderRoutes = require("./routes/reminderRoutes");
// const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// const path = require("path");
// const colors = require("colors");


// connectDB();
// const app = express();

// app.use(express.json()); // to accept json data

// app.use("/api/user", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/message", messageRoutes);
// app.use("/api/reminders", reminderRoutes);

// // --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// // --------------------------deployment------------------------------

// // Error Handling middlewares
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT;

// const server = app.listen(PORT, () => {
// 	console.log(`🚀 Server running on PORT ${PORT}...`.yellow.bold);
// 	// ✅ Start the reminder checker
//   });
  
// // ============ SOCKET.IO SETUP WITH REMINDERS =============
// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

// const Reminder = require("./models/reminderModel");

// io.on("connection", (socket) => {
//   console.log("Connected to socket.io");

//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     socket.emit("connected");
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//     console.log("User Joined Room: " + room);
//   });

//   socket.on("joinChats", (chatIds) => {
//     chatIds.forEach((id) => socket.join(id));
// 	console.log("Joined chats:", chatIds);
//   });

//   socket.on("typing", (room) => socket.in(room).emit("typing"));
//   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

//   socket.on("new message", (newMessageRecieved) => {
//     var chat = newMessageRecieved.chat;

//     if (!chat.users) return console.log("chat.users not defined");

//     chat.users.forEach((user) => {
//       if (user._id == newMessageRecieved.sender._id) return;

//       socket.in(user._id).emit("message recieved", newMessageRecieved);
//     });
//   });

//   socket.off("setup", () => {
//     console.log("USER DISCONNECTED");
//     socket.leave(socket.id);
//   });
// });

// // ============ REMINDER SCHEDULER =============

// // const emitDueReminders = async (io) => {
// //   const now = new Date();

// //   const dueReminders = await Reminder.find({
// //     isDone: false,
// //     dueAt: { $lte: now },
// //   })
// //     .populate("user", "name _id")
// //     .populate("chat", "users");

// //   dueReminders.forEach((reminder) => {
// //     const payload = {
// //       _id: reminder._id,
// //       message: reminder.message,
// //       dueAt: reminder.dueAt,
// //       type: reminder.type,
// //       chatId: reminder.chat?._id,
// //       userId: reminder.user._id,
// //       createdBy: reminder.user.name,
// //     };

// //     if (reminder.type === "me") {
// //       io.to(reminder.user._id.toString()).emit("reminderDue", payload);
// //     } else if (reminder.type === "us") {
// //       io.to(reminder.chat._id.toString()).emit("reminderDue", payload);
// //     }
// //   });
// // };
// runReminderCron(io); 
