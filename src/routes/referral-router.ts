import express from "express";
import { ReferralController } from "../controllers/referral-controller";

const referralRouter = (router: express.Router) => {
  // Generate a unique referral link for a user
  router.post("/referral/generate/:userId", ReferralController.generateReferralLink);
  
  // Update referral status when invitee accepts
  router.patch("/referral/status/:referralCode", ReferralController.updateReferralStatus);
  
  // Query referral data by referrer or invitee
  router.get("/referral/:userId", ReferralController.getReferrals);
};

export default referralRouter;