import { Request, Response } from 'express';
import {
  SecretDropCapsuleModel,
  SecretDropSchema,
} from '../models/secretDropCapsule';
import crypto from 'crypto';

const HASH_LENGTH = 12;
const PEPPER = process.env.SECRET_HASH_PEPPER!;

export function generateUniqueHash(capsule): string {
  const input = `${capsule._id}${capsule.createdAt.toISOString()}${PEPPER}`;

  return crypto
    .createHash('sha3-256') //
    .update(input)
    .digest('base64url')
    .substring(0, HASH_LENGTH);
}

export const createSecretDropCapsule = async (req: Request, res: Response) => {
  try {
    const validated = SecretDropSchema.parse(req.body);
    const capsule = new SecretDropCapsuleModel({
      ...validated,
      creatorId: req.user!.id,
      location: {
        type: 'Point',
        coordinates: validated.location.coordinates,
      },
    });

    await capsule.save();

    res.status(201).json({
      id: capsule._id,
      message: 'Capsule created successfully',
      hash: generateUniqueHash(capsule),
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid input',
    });
  }
};

export const getCapsule = async (req: Request, res: Response) => {
  try {
    const capsule = await SecretDropCapsuleModel.findOne({
      _id: req.params.id,
      creatorId: req.user!.id,
    }).lean();

    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });
    res.json(capsule);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCapsule = async (req: Request, res: Response) => {
  try {
    const validated = SecretDropSchema.parse(req.body);
    const capsule = await SecretDropCapsuleModel.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user!.id },
      { $set: validated },
      { new: true, runValidators: true }
    );

    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });
    res.json(capsule);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid input',
    });
  }
};

export const deleteCapsule = async (req: Request, res: Response) => {
  try {
    const capsule = await SecretDropCapsuleModel.findOneAndDelete({
      _id: req.params.id,
      creatorId: req.user!.id,
    });

    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
