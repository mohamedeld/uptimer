import { INotificationDocument } from "@app/interfaces/notification.interface";
import { NotificationModel } from "@app/models/notification.model";
import { Model } from "sequelize";

export async function createNotificationGroup(
  data: INotificationDocument,
): Promise<INotificationDocument> {
  try {
    const result: Model = await NotificationModel.create(data);
    return result?.dataValues as INotificationDocument;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getNotificationGroupsByUserId(
  userId: number,
): Promise<INotificationDocument> {
  try {
    const notifications = await NotificationModel.findOne({
      where: {
        userId,
      },
      order: ["createdAt", "DESC"],
    });
    return notifications?.dataValues as INotificationDocument;
  } catch (error) {
    throw new Error(error);
  }
}
export async function getNotificationsGroups(
  userId: number,
): Promise<INotificationDocument[]> {
  try {
    const notifications = await NotificationModel.findAll({
      where: {
        userId,
      },
      order: ["createdAt", "DESC"],
    });
    return notifications.map(
      (notification) => notification.dataValues,
    ) as INotificationDocument[];
  } catch (error) {
    throw new Error(error);
  }
}

export async function updateNotificationGroup(
  notificationId: number,
  data: INotificationDocument,
): Promise<INotificationDocument> {
  try {
    const notification = await NotificationModel.findByPk(notificationId);
    if (!notification) {
      throw new Error("Notification group not found");
    }
    const updatedNotification = await notification.update(data);
    return updatedNotification?.dataValues as INotificationDocument;
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteNotificationGroup(notificationId: number) {
  try {
    await NotificationModel.destroy({
      where: {
        id: notificationId,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
}
