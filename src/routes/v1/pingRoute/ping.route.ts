import express, { Response, Request } from 'express';
import ApiResponse from '../../../utils/ApiResponse';

const router = express.Router();

router.get('/ping', (req: Request, res: Response) => {
  return res.status(200).json(new ApiResponse(200, {}, 'Pong'));
});

export default router;
