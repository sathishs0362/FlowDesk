import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtUser } from "../modules/auth/auth.types";

export const generateAccessToken = (payload: JwtUser): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtUser => {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  const tokenUser = decoded as Partial<JwtUser>;

  if (!tokenUser.id || !tokenUser.email || !tokenUser.role) {
    throw new Error("Token payload missing required fields");
  }

  return {
    id: tokenUser.id,
    email: tokenUser.email,
    role: tokenUser.role,
  };
};
