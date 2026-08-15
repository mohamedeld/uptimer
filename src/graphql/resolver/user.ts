import { sign, SignOptions } from "jsonwebtoken";
import { AppContext } from "@app/interfaces/app-context";
import { INotificationDocument } from "@app/interfaces/notification.interface";
import { IUserDocument, IUserResponse } from "@app/interfaces/User.interface";
import {
  createNotificationGroup,
  getNotificationsGroups,
} from "@app/services/notification.service";

import {
  createNewUser,
  getUserByProp,
  getUserBySocialId,
} from "@app/services/user.service";
import { Request } from "express";
import { GraphQLError } from "graphql";
import { toLower, upperFirst } from "lodash";
import { UserModel } from "@app/models/user.model";
import { Op } from "sequelize";
import { authenticateGraphQLRoute, isEmail } from "@app/utils/utils";
import { UserLoginRules, UserRegisterationRules } from "@app/validations/user";

export const UserResolver = {
  Query: {
    async checkCurrentUser(
      _: undefined,
      __: undefined,
      contextValue: AppContext,
    ) {
      const { req } = contextValue;
      authenticateGraphQLRoute(req);
      const notifications = await getNotificationsGroups(req.currentUser!.id);
      return {
        user: {
          id: req.currentUser?.id,
          username: req.currentUser?.username,
          email: req.currentUser?.email,
          createdAt: new Date(),
        },
        notifications,
      };
    },
  },
  User: {
    createdAt: (user: IUserDocument) => {
      return user.createdAt?.toISOString() ?? null;
    },
  },
  Mutation: {
    async registerUser(
      _: undefined,
      args: { user: IUserDocument },
      contextValue: AppContext,
    ) {
      const { req } = contextValue;
      const { user } = args;
      await UserRegisterationRules.validate(user, { abortEarly: false });
      const { username, email, password } = user;
      const checkIfUserExist = await UserModel.findOne({
        where: {
          [Op.or]: [
            { username: upperFirst(username) },
            {
              email: toLower(email),
            },
          ],
        },
      });
      if (checkIfUserExist) {
        throw new GraphQLError("Invalid crendentials. Email or username.");
      }
      const authData: IUserDocument = {
        username: upperFirst(username),
        email: toLower(email),
        password,
      } as IUserDocument;
      const result: IUserDocument | undefined = await createNewUser(authData);
      const response = await userReturnValue(req, result, "register");
      return response;
    },
    async loginUser(
      _: undefined,
      args: { username: string; password: string },
      contextValue: AppContext,
    ) {
      const { req } = contextValue;
      const { username, password } = args;
      await UserLoginRules.validate(
        { username, password },
        { abortEarly: false },
      );
      const isValidEmail = isEmail(username);
      const type: string = !isValidEmail ? "username" : "email";
      const existingUser: IUserDocument | undefined = await getUserByProp(
        username,
        type,
      );
      if (!existingUser) {
        throw new GraphQLError("Invalid credentials");
      }
      const passwordsMatch = await UserModel.prototype.comparePassword(
        password,
        existingUser?.password!,
      );
      if (!passwordsMatch) {
        throw new GraphQLError("Invalid credentials");
      }
      const response: IUserResponse = await userReturnValue(
        req,
        existingUser,
        "login",
      );
      return response;
    },
    async authSocialUser(
      _: undefined,
      args: { user: IUserDocument },
      contextValue: AppContext,
    ) {
      const { req } = contextValue;
      const { user } = args;
      const { username, email, googleId } = user;
      const checkIfUserExist: IUserDocument | undefined =
        await getUserBySocialId(googleId!, email!);
      if (checkIfUserExist) {
        const response: IUserResponse = await userReturnValue(
          req,
          checkIfUserExist,
          "login",
        );
        return response;
      } else {
        const authData: IUserDocument = {
          username: upperFirst(username),
          email: toLower(email),
          googleId: googleId,
        } as IUserDocument;
        const result: IUserDocument | undefined = await createNewUser(authData);
        const response: IUserResponse = await userReturnValue(
          req,
          result,
          "register",
        );
        return response;
      }
    },
    logout(_: undefined, __: undefined, appContext: AppContext) {
      const { req } = appContext;
      req.session = null;
      req.currentUser = undefined;
      return null;
    },
  },
};

async function userReturnValue(
  req: Request,
  result: IUserDocument,
  type: string,
): Promise<IUserResponse> {
  let notifications: INotificationDocument[] = [];
  if (type === "register" && result && result?.id && result?.email) {
    const notification = await createNotificationGroup({
      userId: result?.id,
      groupName: "Default Contact Group",
      emails: JSON.stringify([result?.email]),
    });
    notifications?.push(notification);
  } else if (type === "login" && result && result?.id && result?.email) {
    notifications = await getNotificationsGroups(result?.id);
  }
  const options: SignOptions = {
    expiresIn: "7d",
  };

  const userJWT = sign(
    {
      id: result?.id,
      username: result?.username,
      email: result?.email,
    },
    process.env.JWT_TOKEN!,
    options,
  );
  req.session = {
    jwt: userJWT,
    enableAutomaticRefresh: false,
  };

  return {
    user: result,
    notifications,
  };
}
