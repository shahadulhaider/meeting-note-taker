import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  token?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.error('Auth error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name,
    };
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
