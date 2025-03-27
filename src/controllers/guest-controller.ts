import { Request, Response } from 'express';
import GuestCapsuleService from '../services/guest-service';

class GuestCapsuleController {
  // Create a new guest capsule
  async createGuestCapsule(req: Request, res: Response) {
    try {
      const { 
        guestEmail, 
        unlockDate, 
        expirationDate, 
        mediaUrls, 
        message, 
        theme 
      } = req.body;

      const guestCapsule = await GuestCapsuleService.createGuestCapsule({
        guestEmail,
        unlockDate: new Date(unlockDate),
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        mediaUrls,
        message,
        theme
      });

      res.status(201).json({
        message: 'Guest capsule created successfully',
        accessCode: guestCapsule.accessCode,
        capsule: guestCapsule
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  // Retrieve a guest capsule
  async getGuestCapsule(req: Request, res: Response) {
    try {
      const { accessCode } = req.params;

      const guestCapsule = await GuestCapsuleService.getGuestCapsuleByAccessCode(accessCode);

      res.status(200).json(guestCapsule);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(404).json({ error: errorMessage });
    }
  }

  // Update a guest capsule
  async updateGuestCapsule(req: Request, res: Response) {
    try {
      const { accessCode } = req.params;
      const updateData = req.body;

      const updatedCapsule = await GuestCapsuleService.updateGuestCapsule(accessCode, updateData);

      res.status(200).json({
        message: 'Guest capsule updated successfully',
        capsule: updatedCapsule
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  // Delete a guest capsule
  async deleteGuestCapsule(req: Request, res: Response) {
    try {
      const { accessCode } = req.params;

      const result = await GuestCapsuleService.deleteGuestCapsule(accessCode);

      res.status(200).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  // Unlock a guest capsule
  async unlockGuestCapsule(req: Request, res: Response) {
    try {
      const { accessCode } = req.params;

      const unlockedCapsule = await GuestCapsuleService.unlockGuestCapsule(accessCode);

      res.status(200).json({
        message: 'Guest capsule unlocked successfully',
        capsule: unlockedCapsule
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }
}

export default new GuestCapsuleController();
