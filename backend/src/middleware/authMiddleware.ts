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

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.header("Authorization");
     console.log("🧠 verifyToken recibido:", header);

  if (!header) {
    console.log("❌ No se envió Authorization header");
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token) {
    console.log("❌ Header sin token Bearer:", header);
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET no definido en el .env");
    return res.status(500).json({ message: "Configuración del servidor inválida" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; username: string };

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      console.log("❌ Usuario no encontrado en base de datos");
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    req.user = { _id: user._id.toString(), username: user.username };
    console.log("✅ Token verificado para:", user.username);

    next();
  } catch (err) {
    console.error("❌ Token inválido o expirado:", err);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
