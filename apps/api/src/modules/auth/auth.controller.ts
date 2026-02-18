import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "../../common/ApiResponse";
import { asyncHandler } from "../../common/asyncHandler";
import { loginUser, registerUser } from "./auth.service";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(Role).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const data = await registerUser(payload);

  return res.status(201).json(new ApiResponse("User registered successfully", data));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const data = await loginUser(payload);

  return res.status(200).json(new ApiResponse("Login successful", data));
});
