import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info("✅ MongoDB conectado correctamente");
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error(`❌ Error al conectar MongoDB: ${error}`);
    process.exit(1);
  }
};
