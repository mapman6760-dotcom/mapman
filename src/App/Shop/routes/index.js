import { Router } from 'express'
import { authRouter } from './authRoutes.js'
import { appRouter } from './appRoutes.js'

const shopRouter = Router()


//authentication
shopRouter.use('/auth', authRouter);

//students
shopRouter.use('/', appRouter);




export { shopRouter }