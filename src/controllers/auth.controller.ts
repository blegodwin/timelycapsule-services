import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt';

// POST /auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	const { email, password, displayName } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({ message: 'Email already exists' });
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		const newUser = await User.create({
			email,
			passwordHash,
			displayName,
			roles: ['user'],
			guest: false,
			isVerified: false,
		});

		const token = generateToken(newUser.id);
		res.status(201).json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
};

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user || user.guest) {
			res.status(400).json({ message: 'Invalid credentials' });
			return;
		}

		const isMatch = await bcrypt.compare(password, user.passwordHash!);
		if (!isMatch) {
			res.status(400).json({ message: 'Invalid credentials' });
			return;
		}

		user.lastLoginAt = new Date();
		await user.save();

		const token = generateToken(user.id);
		res.json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
};

// POST /auth/logout
export const logout = async (_req: Request, res: Response): Promise<void> => {
	res.status(200).json({ message: 'Logged out' });
};

// POST /auth/guest
export const guest = async (_req: Request, res: Response): Promise<void> => {
	try {
		const guestUser = await User.create({
			email: null,
			passwordHash: null,
			displayName: `Guest_${Date.now()}`,
			roles: ['guest'],
			guest: true,
			isVerified: false,
		});

		const token = generateToken(guestUser.id);
		res.status(201).json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).send('Server error');
	}
};
