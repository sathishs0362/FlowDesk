import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`FlowDesk API running on port ${env.PORT}`);
    });

    const gracefulShutdown = (signal: string): void => {
      console.log(`${signal} received. Closing server...`);

      server.close(async (serverError) => {
        if (serverError) {
          console.error("Error while closing HTTP server:", serverError);
          process.exit(1);
          return;
        }

        try {
          await disconnectDB();
          process.exit(0);
        } catch (dbError) {
          console.error("Error while disconnecting Prisma:", dbError);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

void startServer();
