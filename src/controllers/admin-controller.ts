import { Request, Response } from 'express';
import { Capsule } from '../models/Capsule';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';

export const deleteCapsule = async (req: Request, res: Response) => {
  try {
    const { capsuleId } = req.params;
    await Capsule.findByIdAndDelete(capsuleId);
    
    // Log action
    const audit = new AuditLog({
      adminId: req.user._id,
      action: 'DELETE_CAPSULE',
      targetUser: req.body.targetUserId,
      details: `Deleted capsule ${capsuleId}`
    });
    await audit.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting capsule' });
  }
};