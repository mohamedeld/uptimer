import { AppContext } from "@app/interfaces/app-context";
import { INotificationDocument } from "@app/interfaces/notification.interface";
import {
  createNotificationGroup,
  deleteNotificationGroup,
  getNotificationGroupById,
  getNotificationsGroups,
  updateNotificationGroup,
} from "@app/services/notification.service";
import { authenticateGraphQLRoute } from "@app/utils/utils";

export const NotificationResolver = {
  Query: {
    async getUserNotificationGroups(
      _: undefined,
      args: { userId: string },
      contextValue: AppContext,
    ) {
      const { req } = contextValue;
      const { userId } = args;
      authenticateGraphQLRoute(req);
      const notifications = await getNotificationsGroups(parseInt(userId));
      return { notifications };
    },
  },
  Mutation: {
    async createNotificationGroup(
      _: undefined,
      args: { group: INotificationDocument },
      ctx: AppContext,
    ) {
      const { req } = ctx;
      authenticateGraphQLRoute(req);
      const notification: INotificationDocument = await createNotificationGroup(
        args.group!,
      );
      return {
        notifications: [notification],
      };
    },
    async updateNotificationGroup(
      _: undefined,
      args: { notificationId: number; group: INotificationDocument },
      ctx: AppContext,
    ) {
      const { req } = ctx;
      authenticateGraphQLRoute(req);
      const { notificationId, group } = args;
      await getNotificationGroupById(notificationId);
      const updatedNotification = await updateNotificationGroup(
        notificationId,
        group,
      );
      return {
        notifications: [updatedNotification],
      };
    },
    async deleteNotificationGroup(
      _: undefined,
      args: { notificationId: number },
      ctx: AppContext,
    ) {
      const { req } = ctx;
      authenticateGraphQLRoute(req);
      const { notificationId } = args;
      await deleteNotificationGroup(notificationId);
      return {
        id: notificationId,
      };
    },
  },
};
