"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        const server = app_1.default.listen(env_1.env.PORT, () => {
            console.log(`FlowDesk API running on port ${env_1.env.PORT}`);
        });
        const gracefulShutdown = (signal) => {
            console.log(`${signal} received. Closing server...`);
            server.close(async (serverError) => {
                if (serverError) {
                    console.error("Error while closing HTTP server:", serverError);
                    process.exit(1);
                    return;
                }
                try {
                    await (0, db_1.disconnectDB)();
                    process.exit(0);
                }
                catch (dbError) {
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
    }
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};
void startServer();
