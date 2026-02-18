import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getUserByIdHandler, getUsersHandler } from "./users.controller";

const usersRoutes = Router();

usersRoutes.use(authMiddleware);

usersRoutes.get("/", getUsersHandler);
usersRoutes.get("/:id", getUserByIdHandler);

export { usersRoutes };
