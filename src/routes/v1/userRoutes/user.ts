
import express from 'express'

import allUserRoutes from './userRoutes'

const router = express.Router()

router.use('/user' , allUserRoutes)

export default router ;