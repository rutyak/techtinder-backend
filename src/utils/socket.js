const { Server } = require("socket.io");
const crypto = require("crypto");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

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

  io.on("connection", (socket) => {
    // handle events
    socket.on("joinChat", ({ targetUserId, firstname }) => {
      const roomId = getSecretRoomId(socket.user.id, targetUserId);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ firstname, targetUserId, text }) => {
      const roomId = getSecretRoomId(socket.user.id, targetUserId);
      io.to(roomId).emit("messageReceive", {
        firstname: socket.user.firstname,
        text,
        senderId: socket.user.id,
      });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
