import express from "express"
import authRouter from "./auth.router"
import userRouter from "./user.router"
import subscriptionRouter from "./subscription.router"

const router = express.Router()
export default (): express.Router => {
  authRouter(router)
  userRouter(router)
  subscriptionRouter(router)
  return router
}

