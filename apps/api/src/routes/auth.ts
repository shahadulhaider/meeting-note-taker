import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { logger } from '../utils/logger';
import { AuthRequest, authenticate } from '../middleware/auth';

const router: ExpressRouter = Router();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Logout (client-side will handle Supabase logout)
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    // Optionally invalidate the session on Supabase
    if (req.token) {
      await supabaseAdmin.auth.admin.signOut(req.token);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;
