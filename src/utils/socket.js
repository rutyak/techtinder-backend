const { Server } = require("socket.io");
const crypto = require("crypto");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const Chat = require("../model/chat");
const User = require("../model/user");

function getSecretRoomId(userId, targetUserId) {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
}

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://techtinder.netlify.app"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");

      const token = cookies.jwtToken;

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = decoded;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  let onlineUsers = new Map();

  io.on("connection", async (socket) => {
    //make user online
    onlineUsers.set(socket.user.id, socket.id);

    socket.on("checkOnline", (targetUserId, callback) => {
      const isOnline = onlineUsers.has(targetUserId);
      callback(isOnline);
    });

    socket.on("joinChat", async ({ targetUserId, firstname }) => {
      const roomId = getSecretRoomId(socket.user.id, targetUserId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstname, targetUserId, text }) => {
      try {
        const roomId = getSecretRoomId(socket.user.id, targetUserId);

        let chat = await Chat.findOne({
          paticipants: { $all: [socket.user.id, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            paticipants: [socket.user.id, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: socket.user.id,
          text,
        });

        await chat.save();

        io.to(roomId).emit("messageReceive", {
          firstname: socket.user.firstname,
          text,
          senderId: socket.user.id,
        });
      } catch (error) {
        console.error(error.message);
      }
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(socket.user.id);
    });
  });
};

module.exports = initializeSocket;
