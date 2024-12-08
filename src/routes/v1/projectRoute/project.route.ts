import express, { Router } from 'express';

import { createProject } from '../../../controllers/project.controller';

const router: Router = express.Router();

router.post('/', createProject);

export default router;
