import { Request, Response } from 'express';

let users = [
  { id: 'user_1', name: 'Demo Customer', email: 'customer@demo.com', role: 'customer', isActive: true },
  { id: 'user_2', name: 'Demo Admin', email: 'admin@demo.com', role: 'admin', isActive: true },
];

export { users };

export const getAll = (_req: Request, res: Response) => {
  res.json({ success: true, message: `${users.length} user(s) found`, data: users });
};

export const register = (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const exists = users.some(u => u.email === email);
  if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

  const user = {
    id: `user_${users.length + 1}_${Date.now().toString(36)}`,
    name,
    email,
    role: 'customer',
    isActive: true,
  };
  users = [...users, user];
  res.status(201).json({ success: true, message: 'User registered', data: { user, token: `dev_token_${user.id}` } });
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

  res.json({ success: true, message: 'Login successful', data: { user, token: `dev_token_${user.id}` } });
};