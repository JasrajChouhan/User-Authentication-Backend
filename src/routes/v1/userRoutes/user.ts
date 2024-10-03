import express from 'express';

import allUserRoutes from './userRoutes';

const router = express.Router();

router.use('/users', allUserRoutes);

export default router;
