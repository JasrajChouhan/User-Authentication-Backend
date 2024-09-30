import express from 'express';


import {
    changeEmail, 
    changePassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    deleteUserAccount
} from "../../../controllers/userController";

import verifyJWT from '../../../middlewares/authenticationMiddleware';

const router = express.Router();


router.post('/signup', registerUser)
router.post('/signin', loginUser)
router.post('/logout', verifyJWT, logoutUser)
router.post('/refreshAccessToken', refreshAccessToken)
router.post('/change/email' , verifyJWT , changeEmail)
router.post('/change/password' , verifyJWT , changePassword)
router.delete('/delete' , verifyJWT , deleteUserAccount)

export default router;


