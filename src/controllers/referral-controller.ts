import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Referral } from '../model/referral-model';

export class ReferralController {
  // Generate a unique referral link for a user
  static async generateReferralLink(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { inviteeEmail } = req.body;

      // Validate input
      if (!userId || !inviteeEmail) {
        return res.status(400).json({ 
          message: 'User ID and invitee email are required' 
        });
      }

      // Generate unique referral code
      const referralCode = uuidv4();

      // Create referral entry
      const referral = new Referral({
        referrerId: userId,
        inviteeEmail,
        referralCode,
        status: 'pending'
      });

      await referral.save();

      res.status(201).json({
        message: 'Referral link generated successfully',
        referralLink: `${process.env.APP_URL}/invite/${referralCode}`,
        referralCode
      });
    } catch (error) {
      console.error('Error generating referral link:', error);
      res.status(500).json({ 
        message: 'Failed to generate referral link',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update referral status when invitee accepts
  static async updateReferralStatus(req: Request, res: Response) {
    try {
      const { referralCode } = req.params;
      const { status } = req.body;

      // Validate input
      if (!referralCode || !['pending', 'accepted'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid referral code or status' 
        });
      }

      // Find and update referral
      const referral = await Referral.findOneAndUpdate(
        { referralCode },
        { 
          status, 
          updatedAt: new Date() 
        },
        { new: true }
      );

      if (!referral) {
        return res.status(404).json({ 
          message: 'Referral not found' 
        });
      }

      res.status(200).json({
        message: 'Referral status updated successfully',
        referral
      });
    } catch (error) {
      console.error('Error updating referral status:', error);
      res.status(500).json({ 
        message: 'Failed to update referral status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Query referral data
  static async getReferrals(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { type = 'referrer' } = req.query;

      let referrals;
      if (type === 'referrer') {
        referrals = await Referral.find({ referrerId: userId });
      } else {
        referrals = await Referral.find({ inviteeEmail: userId });
      }

      res.status(200).json({
        message: 'Referrals retrieved successfully',
        referrals
      });
    } catch (error) {
      console.error('Error retrieving referrals:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve referrals',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}