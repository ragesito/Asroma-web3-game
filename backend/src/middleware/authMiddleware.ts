import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

export interface AuthUser {
  _id: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const isDev = process.env.NODE_ENV !== "production";

const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.header("Authorization");
     devLog("🧠 verifytoken received:", header);

  if (!header) {
    devLog("❌ Authorization header was not sent");
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token) {
    devLog("❌ Header without Bearer token:", header);
    return res.status(401).json({ message: "Invalid token format" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET no definido en el .env");
    return res.status(500).json({ message: "Invalid server configuration" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; username: string };

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      devLog("❌ User not found in the database");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { _id: user._id.toString(), username: user.username };
    devLog("✅ Token verified for:", user.username);

    next();
  } catch (err) {
    console.error("❌ Invalid or expired token:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
