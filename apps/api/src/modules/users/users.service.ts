import { AppError } from "../../common/AppError";
import { prisma } from "../../config/db";
import { PublicUser } from "./users.types";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

const toPublicUser = (user: PublicUser): PublicUser => {
  return user;
};

export const getUsers = async (): Promise<PublicUser[]> => {
  const users = await prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { createdAt: "desc" },
  });

  return users.map(toPublicUser);
};

export const getUserById = async (id: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return toPublicUser(user);
};
