import { Role } from "@prisma/client";

export interface JwtUser {
  id: string;
  email: string;
  role: Role;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface AuthPayload {
  user: PublicUser;
  accessToken: string;
}
