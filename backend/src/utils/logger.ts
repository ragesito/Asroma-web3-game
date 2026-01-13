import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = isDev
  ? pino({
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    })
  : pino({
      level: "info",
    });
