import { IAuthPayload } from "@app/interfaces/User.interface";
import { env } from "@app/server/config";
import { Request } from "express";
import { GraphQLError } from "graphql";
import { verify } from "jsonwebtoken";

export const isEmail = (email: string): boolean => {
  const regexExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
  return regexExp.test(email);
};

export const authenticateGraphQLRoute = (req: Request): void => {
  if (!req.session?.jwt) {
    throw new GraphQLError("Please login again.");
  }
  try {
    const payload: IAuthPayload = verify(
      req.session?.jwt,
      env.JWT_TOKEN,
    ) as IAuthPayload;
    req.currentUser = payload;
  } catch (error) {
    throw new GraphQLError("Please login again.");
  }
};
