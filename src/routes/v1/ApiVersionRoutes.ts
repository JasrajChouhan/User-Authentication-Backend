import express from 'express';
import pingRouteV1 from '../v1/pingRoute/ping.route';
import projectRouteV1 from '../v1/projectRoute/project';
import userRoutesV1 from '../v1/userRoutes/user';
import verifyJWT from '../../middlewares/authenticationMiddleware';
const router = express.Router();

router.use('/v1', userRoutesV1);
router.use('/v1', pingRouteV1);
router.use('/v1', verifyJWT, projectRouteV1);
export default router;
