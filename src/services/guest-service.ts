import mongoose from 'mongoose';
//@ts-ignore
import GuestCapsule from '../models/GuestCapsule'; 
import { v4 as uuidv4 } from 'uuid';

interface CreateGuestCapsuleDTO {
  guestEmail: string;
  unlockDate: Date;
  expirationDate?: Date;
  mediaUrls?: string[];
  message?: string;
  theme?: string;
}

class GuestCapsuleService {
  // Create a new guest capsule
  async createGuestCapsule(data: CreateGuestCapsuleDTO) {
    try {
      // Generate a unique access code
      const accessCode = uuidv4();

      const guestCapsule = new GuestCapsule({
        ...data,
        accessCode,
        status: 'Pending'
      });

      await guestCapsule.save();
      return guestCapsule;
    } catch (error) {
      throw new Error(`Failed to create guest capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Retrieve a guest capsule by access code
  async getGuestCapsuleByAccessCode(accessCode: string) {
    try {
      const guestCapsule = await GuestCapsule.findOne({ accessCode });
      
      if (!guestCapsule) {
        throw new Error('Guest capsule not found');
      }

      // Check if capsule is expired
      if (guestCapsule.expirationDate && guestCapsule.expirationDate < new Date()) {
        guestCapsule.status = 'Expired';
        await guestCapsule.save();
        throw new Error('Capsule has expired');
      }

      return guestCapsule;
    } catch (error) {
      throw new Error(`Failed to retrieve guest capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update a guest capsule
  async updateGuestCapsule(accessCode: string, updateData: Partial<CreateGuestCapsuleDTO>) {
    try {
      const guestCapsule = await GuestCapsule.findOneAndUpdate(
        { accessCode },
        updateData,
        { new: true }
      );

      if (!guestCapsule) {
        throw new Error('Guest capsule not found');
      }

      return guestCapsule;
    } catch (error) {
      throw new Error(`Failed to update guest capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a guest capsule
  async deleteGuestCapsule(accessCode: string) {
    try {
      const result = await GuestCapsule.findOneAndDelete({ accessCode });

      if (!result) {
        throw new Error('Guest capsule not found');
      }

      return { message: 'Guest capsule deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete guest capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Unlock a guest capsule
  async unlockGuestCapsule(accessCode: string) {
    try {
      const guestCapsule = await this.getGuestCapsuleByAccessCode(accessCode);

      // Check if it's time to unlock
      if (guestCapsule.unlockDate > new Date()) {
        throw new Error('Capsule cannot be unlocked yet');
      }

      guestCapsule.status = 'Unlocked';
      await guestCapsule.save();

      return guestCapsule;
    } catch (error) {
      throw new Error(`Failed to unlock guest capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new GuestCapsuleService();
