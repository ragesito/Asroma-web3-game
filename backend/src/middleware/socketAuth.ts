import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

/**
 * Socket.IO handshake authentication.
 *
 * Mirrors verifyToken (the HTTP middleware): same JWT, same secret, same
 * "does this user still exist" check. Once this runs, socket.data.userId is
 * the only trustworthy identity for the lifetime of the connection.
 *
 * Handlers MUST read socket.data.userId and MUST NOT accept an id from an
 * event payload — a payload id is attacker-controlled.
 */
export const socketAuth = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    return next(new Error("UNAUTHORIZED"));
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET no definido en el .env");
    return next(new Error("SERVER_MISCONFIGURED"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      username: string;
    };

    // A token can outlive the account it names (deleted user, cleanup cron).
    const user = await User.findById(decoded.id).select("username").lean();
    if (!user) {
      return next(new Error("UNAUTHORIZED"));
    }

    socket.data.userId = String(user._id);
    socket.data.username = user.username;

    return next();
  } catch {
    // Expired or forged token. Deliberately opaque: never tell the client which.
    return next(new Error("UNAUTHORIZED"));
  }
};
