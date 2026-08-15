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
  getUserByUserNameOrEmail,
} from "@app/services/user.service";
import { Request } from "express";
import { GraphQLError } from "graphql";
import { toLower, upperFirst } from "lodash";

export const UserResolver = {
  Mutation: {
    async registerUser(
      _: undefined,
      args: { user: IUserDocument },
      contextValue: AppContext,
    ) {
      const { req } = contextValue;
      const { user } = args;
      const { username, email, password } = user;
      const checkIfUserExist: IUserDocument | undefined =
        await getUserByUserNameOrEmail(username!, email!);
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
