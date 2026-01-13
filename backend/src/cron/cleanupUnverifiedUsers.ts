import cron from "node-cron";
import { User } from "../models/user";
import { logger } from "../utils/logger";

cron.schedule("0 * * * *", async () => {
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoffDate },
    });

    if (result.deletedCount && result.deletedCount > 0) {
      logger.info(
        `🧹 CRON: ${result.deletedCount} cuentas no verificadas eliminadas`
      );
    }
 } catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : JSON.stringify(error);

  logger.error(`❌ CRON error limpiando cuentas no verificadas: ${message}`);
}

});
