import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "../../common/ApiResponse";
import { asyncHandler } from "../../common/asyncHandler";
import { getUserById, getUsers } from "./users.service";

const userIdSchema = z.object({
  id: z.string().uuid(),
});

export const getUsersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const users = await getUsers();

  return res
    .status(200)
    .json(new ApiResponse("Users fetched successfully", users, { total: users.length }));
});

export const getUserByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const params = userIdSchema.parse(req.params);
  const user = await getUserById(params.id);

  return res.status(200).json(new ApiResponse("User fetched successfully", user));
});
