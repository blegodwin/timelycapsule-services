
import { Request, Response } from 'express';
import { Invitation } from '../models/Invitation';
import { Capsule } from '../models/Capsule';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { sendResponseNotification } from '../services/notificationService';

export const getMyInvitations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const invitations = await Invitation.find({
      email: user.email,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .populate('capsule', 'title')
      .populate('inviter', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        invitations: invitations.map((inv) => ({
          _id: inv._id,
          capsule: inv.capsule,
          inviter: inv.inviter,
          role: inv.role,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invitations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const respondToInvitation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "decline"',
      });
    }

    const invitation = await Invitation.findById(id)
      .populate('capsule', 'title collaborators maxCollaborators')
      .populate('inviter', '_id');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    // Check if user is the invitee
    const user = await User.findById(userId);
    if (!user || user.email !== invitation.email) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this invitation',
      });
    }

    // Check if invitation is still valid
    if (invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired',
      });
    }

    if (action === 'accept') {
      // Check if capsule has space for collaborators
      const capsule = invitation.capsule as any;
      if (capsule.collaborators.length >= capsule.maxCollaborators) {
        return res.status(400).json({
          success: false,
          message: 'Capsule has reached maximum collaborators',
        });
      }

      // Add user as collaborator
      capsule.collaborators.push(userId);
      await capsule.save();

      // Link user to invitation
      invitation.invitee = userId;
    }

    // Update invitation status
    invitation.status = action === 'accept' ? 'accepted' : 'declined';
    await invitation.save();

    // Send notification to inviter
    await sendResponseNotification(
      invitation.inviter._id,
      user._id,
      invitation.capsule._id,
      action
    );

    res.status(200).json({
      success: true,
      message: `Invitation ${action}ed successfully`,
      data: {
        status: invitation.status,
      },
    });
  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process invitation response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
