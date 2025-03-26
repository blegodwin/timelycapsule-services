import Notification, { INotification } from "../model/notification.model";

export const createNotification = async (data: Partial<INotification>) => {
  return await Notification.create(data);
};

export const getAllNotifications = async () => {
  return await Notification.find();
};

export const getNotificationById = async (id: string) => {
  return await Notification.findById(id);
};

export const updateNotification = async (id: string, data: Partial<INotification>) => {
  return await Notification.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteNotification = async (id: string) => {
  return await Notification.findByIdAndDelete(id);
};


export const markNotificationAsRead = async (notificationId: string) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId },
      { isRead: true },
      { new: true }
    );
  
    if (!notification) {
      throw new Error("Notification not found or access denied");
    }
  
    return notification;
  };