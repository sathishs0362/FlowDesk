import { Role, User } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../common/AppError";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateAccessToken } from "../../utils/jwt";
import { AuthPayload, LoginInput, PublicUser, RegisterInput } from "./auth.types";

const toPublicUser = (user: User): PublicUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

const toAuthPayload = (user: User): AuthPayload => {
  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    }),
  };
};

export const registerUser = async (input: RegisterInput): Promise<AuthPayload> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: input.role ?? Role.employee,
    },
  });

  return toAuthPayload(user);
};

export const loginUser = async (input: LoginInput): Promise<AuthPayload> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const passwordMatches = await comparePassword(input.password, user.password);

  if (!passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return toAuthPayload(user);
};
