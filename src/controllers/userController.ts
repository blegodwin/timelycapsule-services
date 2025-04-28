import { Request, Response } from 'express';
import User from '../models/user.model';


export async function getUsers(req: Request, res: Response) {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

export async function getSelf(req: Request, res: Response) {
  try {
    // Check if req.user exists and has an id property
    if (!req.user || !req.user._id) {
      res.status(401).json({ error: 'User ID not found in token' });
      return;
    }
    
    // Use the id property from the token
    const userId = req.user._id;
    
    // Find the user in the database
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
       res.status(404).json({ error: 'User not found in database' });
       return;
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Error in getSelf:', err);
    res.status(500).json({ error: 'Failed to fetch user'});
  }
}


export async function updateSelf(req: Request, res: Response) {
  try {
    const user = await User.findByIdAndUpdate(req.user?._id, req.body, { new: true }).select('-passwordHash');
    
    res.status(200).json(user);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
    return;
  }
}
