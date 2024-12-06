import { Router } from 'express';

import verifyJWT from '../../../middlewares/authenticationMiddleware';
import allProjectRoutes from './project.route';

const router: Router = Router();

router.use('/projects', verifyJWT, allProjectRoutes);

export default router;
