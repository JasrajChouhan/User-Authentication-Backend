import express from 'express';
import userRoutesV1 from '../v1/userRoutes/user';
import pingRouteV1 from '../v1/pingRoute/ping.route';

const router = express.Router();

router.use('/v1', userRoutesV1);
router.use('/v1', pingRouteV1);

export default router;
