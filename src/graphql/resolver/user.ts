import { AppContext } from "@app/interfaces/app-context";
import { IUserDocument, IUserResponse } from "@app/interfaces/User.interface";
import {
  createNewUser,
  getUserByUserNameOrEmail,
} from "@app/services/user.service";
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
    },
  },
};
