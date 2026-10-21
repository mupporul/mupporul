import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const usersRouter = Router();

// GET /api/users - list all users
usersRouter.get('/', (_req: Request, res: Response) => {
  try {
    const list = db.getUsers();
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id - get single user
usersRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const { password, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users/login - login user
usersRouter.post('/login', (req: Request, res: Response) => {
  try {
    const username = req.body.username || req.body.identifier || req.body.email;
    const password = req.body.password;
    if (!username) {
      res.status(400).json({ success: false, error: 'Username or email is required' });
      return;
    }

    const user = db.authenticate(username, password);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid username/email or password. Please check your credentials and try again.',
      });
      return;
    }

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Login successful',
      data: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users - create new user (Admin only)
usersRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, username, password, email, role } = req.body;
    if (!name || !username || !password) {
      res.status(400).json({ success: false, error: 'Name, username, and password are required' });
      return;
    }

    const newUser = db.createUser({
      name,
      username,
      password,
      email,
      role: role || 'user',
    });

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: safeUser,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id - delete user (Admin only)
usersRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = db.deleteUser(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/users/:id/password - update password for user
usersRouter.put('/:id/password', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 4) {
      res.status(400).json({ success: false, error: 'New password must be at least 4 characters long' });
      return;
    }

    db.updatePassword(id, newPassword.trim(), currentPassword ? currentPassword.trim() : undefined);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/users/change-password - change password using username, email, or id
usersRouter.post('/change-password', (req: Request, res: Response) => {
  try {
    const identifier = req.body.identifier || req.body.username || req.body.email;
    const { currentPassword, newPassword } = req.body;

    if (!identifier) {
      res.status(400).json({ success: false, error: 'Username or email is required' });
      return;
    }
    if (!newPassword || newPassword.trim().length < 4) {
      res.status(400).json({ success: false, error: 'New password must be at least 4 characters long' });
      return;
    }

    db.updatePassword(identifier, newPassword.trim(), currentPassword ? currentPassword.trim() : undefined);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

