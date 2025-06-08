import { Notification } from '../model/Notification';
import { User } from '../model/User';

export const sendResponseNotification = async (
  inviterId: string,
  inviteeId: string,
  capsuleId: string,
  action: string
) => {
  try {
    const invitee = await User.findById(inviteeId).select('username');
    if (!invitee) return;

    const message =
      action === 'accept'
        ? `${invitee.username} has accepted your collaboration invitation`
        : `${invitee.username} has declined your collaboration invitation`;

    const notification = new Notification({
      user: inviterId,
      type: 'collaboration',
      message,
      referenceId: capsuleId,
    });

    await notification.save();
  } catch (error) {
    console.error('Notification error:', error);
  }
};
