import express from 'express';

import {
  changeEmail,
  changePassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  deleteUserAccount,
  getCurrentLoggedInUser,
  getUserById,
  googleAuth,
} from '../../../controllers/userController';

import verifyJWT from '../../../middlewares/authenticationMiddleware';

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
router.post('/google' , googleAuth)

export default router;
