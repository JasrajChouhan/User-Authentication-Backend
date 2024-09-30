import express from 'express';
import userRoutesV1 from './user';

const router = express.Router();

router.use('/v1', userRoutesV1)

export default router;