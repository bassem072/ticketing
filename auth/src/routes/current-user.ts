import { Router } from 'express';
import { CurrentUser } from '@bastickets/common';

const router = Router();

router.get('/api/users/current-user', CurrentUser, (req, res) => {
  res.json({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
