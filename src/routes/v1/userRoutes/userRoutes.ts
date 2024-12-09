import express from 'express';

import {
  changeEmail,
  changePassword,
  deleteUserAccount,
  getCurrentLoggedInUser,
  getUserById,
  googleAuth,
  isUsernameExist,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  uploadAvatar,
} from '../../../controllers/user.controller';

import verifyJWT from '../../../middlewares/authenticationMiddleware';
import { upload } from '../../../middlewares/multer.middleware';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.post('/refresh/access-token', refreshAccessToken);
router.post('/change/email', verifyJWT, changeEmail);
router.post('/change/password', verifyJWT, changePassword);
router.delete('/delete/user/account', verifyJWT, deleteUserAccount);
router.get('/me', verifyJWT, getCurrentLoggedInUser);
router.get('/:id', verifyJWT, getUserById);
router.post('/google', googleAuth);
router.post('/username/exist', isUsernameExist);
router.post('/upload/avatar', verifyJWT, upload.single('avatar'), uploadAvatar);

export default router;
