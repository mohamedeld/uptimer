import { UserModel } from "@app/models/user.model";
import { Model, Op } from "sequelize";
import omit from "lodash/omit";
import { toLower, upperFirst } from "lodash";
import { IUserDocument } from "@app/interfaces/User.interface";

export async function createNewUser(
  data: IUserDocument,
): Promise<IUserDocument> {
  try {
    const existingEmail = await UserModel.findOne({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new Error("Email already exists");
    }
    const result: Model = await UserModel.create(data);
    const userData = omit(result?.dataValues, ["password"]);
    return userData as IUserDocument;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getUserByUserNameOrEmail(
  username: string,
  email: string,
): Promise<IUserDocument> {
  const user = await UserModel.findOne({
    where: {
      [Op.or]: [
        { username: upperFirst(username) },
        {
          email: toLower(email),
        },
      ],
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user?.dataValues as IUserDocument;
}

export async function getUserBySocialId(
  socialId: string,
  email: string,
): Promise<IUserDocument> {
  const user = await UserModel.findOne({
    where: {
      [Op.or]: [{ googleId: socialId }, { email: toLower(email) }],
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user?.dataValues as IUserDocument;
}

export async function getUserByProp(
  prop: string,
  type: string,
): Promise<IUserDocument> {
  const user = await UserModel.findOne({
    where: {
      ...(type === "username" && { username: upperFirst(prop) }),
      ...(type === "email" && { email: toLower(prop) }),
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user?.dataValues as IUserDocument;
}
