import { IUserDocument } from "@app/interfaces/User.interface";
import { DataTypes, Model, ModelDefined, Optional } from "sequelize";
import {sequelize} from "../server/database";
interface UserModelInstanceMethods extends Model {
    prototype:{
        comparePassword:(password:string,hashedPassword:string)=> Promise<boolean>;
        hashPassword:(password:string)=> Promise<string>;
    }
}

type UserCreationAttributes = Optional<IUserDocument, 'id' | 'createdAt'>;

const UserModel:ModelDefined<IUserDocument,UserCreationAttributes> & UserModelInstanceMethods = sequelize.define(
    'users',
    {
        username:{
            type:DataTypes.STRING
        }
    }
)as ModelDefined<IUserDocument,UserCreationAttributes> & UserModelInstanceMethods;

export {UserModel}