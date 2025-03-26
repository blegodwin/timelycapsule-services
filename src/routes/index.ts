import express from "express";
import authRouter from "./auth.router";
import userRouter from "./user.router";
import paymentRouter from "./payment.router";

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  userRouter(router);
  paymentRouter(router);
  return router;
};
