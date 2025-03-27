import express from "express";
import { PaymentController } from "../controllers/payment.controller";
import auth from "../middleware/auth";

const paymentRouter = (router: express.Router) => {
 
  router.post("/payments", auth, PaymentController.createPayment);

  
  router.get(
    "/payments",
    auth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await PaymentController.getAllPayments(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

 
  router.get(
    "/user/payments",
    auth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await PaymentController.getUserPayments(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

 
  router.get(
    "/payments/:id",
    auth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await PaymentController.getPaymentById(req, res);
      } catch (error) {
        next(error);
      }
    }
  );


  router.patch(
    "/payments/:id",
    auth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await PaymentController.updatePayment(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

 
  router.delete(
    "/payments/:id",
    auth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await PaymentController.deletePayment(req, res);
      } catch (error) {
        next(error);
      }
    }
  );


  router.patch(
    "/payments/:id/status",
    auth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await PaymentController.updatePaymentStatus(req, res);
      } catch (error) {
        next(error);
      }
    }
  );
};

export default paymentRouter;
