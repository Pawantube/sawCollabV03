const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const getRemindersForChat = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.user._id;
  const status = req.query.status || "active";
  const now = new Date();

  const reminders = await Reminder.find({
    chat: chatId,
    type: "us",
  }).sort({ dueAt: 1 });

  const filtered = reminders.filter((reminder) => {
    const snoozeEntry = reminder.snoozedBy.find(
      (s) => s.user.toString() === userId.toString()
    );
    const isSnoozed = snoozeEntry && new Date(snoozeEntry.until) > now;
    const isMarkedDone = reminder.markedDoneBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (status === "done") return isMarkedDone;
    return !isSnoozed && !isMarkedDone;
  });

  res.json(filtered);
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
