import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import "./cron/cleanupUnverifiedUsers";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import { setupChatSocket } from "./sockets/chatSocket";
import authRoutes from "./routes/authRoutes";
import friendRoutes from "./routes/friendRoutes";
import messageRoutes from "./routes/messageRoutes";
import { logger } from "./utils/logger";
import { setupFriendSocket } from "./sockets/friendSocket";
import path from "path";
import userRoutes from "./routes/userRoutes";
import { setupGameSocket } from "./sockets/gameSocket";
import statsRoutes from "./routes/stats";
import leaderboardRoutes from "./routes/leaderboard";
import publicUserRoutes from "./routes/publicUser";
import leaderboardUserRoutes from "./routes/leaderboardUser";
import { startSeasonWatcher } from "./utils/seasonManager";
import seasonRoutes from "./routes/seasonRoutes";
import walletRoutes from "./routes/walletRoutes";
import balanceRoutes from "./routes/balanceRoutes";
import phantomAuthRoutes from "./routes/phantomAuthRoutes";
connectDB();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://asroma.app", "https://www.asroma.app"]
    : ["http://localhost:3000"];

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(helmet());
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/leaderboard/user", leaderboardUserRoutes);
app.use("/api/public", publicUserRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/wallets", balanceRoutes);
app.use("/api/auth/phantom", phantomAuthRoutes);
app.use("/uploads", (req, res, next) => {res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");next();}, express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Sockets (chat)
setupChatSocket(io);
setupFriendSocket(io);
setupGameSocket(io);

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);

  // Start Seaons auto
  startSeasonWatcher();
});


export { io };
