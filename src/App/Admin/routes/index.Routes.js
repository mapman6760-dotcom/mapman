import { Router } from 'express'
import { authRouter } from './auth.Routes.js'
import { managementRouter } from './management.Routes.js'


const adminRouter = Router()


adminRouter.use('/auth', authRouter)
adminRouter.use('/manage', managementRouter)


export { adminRouter }