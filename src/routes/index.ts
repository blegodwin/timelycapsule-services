import express from "express";
import authRouter from "./auth.router";
import userRouter from "./user.router";
import analyticRouter from "./analytic.router";

const router = express.Router();
export default (): express.Router => {
  authRouter(router);
  userRouter(router);
  //analyticRouter(router);
  return router;
};
