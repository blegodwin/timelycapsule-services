// controllers/capsule.controller.ts
import { Request, Response } from "express";
import * as capsuleService from "../services/capsule.service";
import { handleResponse } from "../utils/responseHandler";

export const createCapsule = async (req: Request, res: Response): Promise<void> => {
  try {
    const capsule = await capsuleService.createCapsule(req.body);
    handleResponse(res, 201, "Capsule created successfully", capsule);
  } catch (error) {
    handleResponse(res, 500, "Error creating capsule", error);
  }
};

export const getCapsule = async (req: Request, res: Response): Promise<void> => {
  try {
    const capsule = await capsuleService.getCapsuleById(req.params.id);
    if (!capsule) {
      handleResponse(res, 404, "Capsule not found");
      return;
    }
    handleResponse(res, 200, "Capsule retrieved", capsule);
  } catch (error) {
    handleResponse(res, 500, "Error fetching capsule", error);
  }
};

export const getCapsules = async (req: Request, res: Response): Promise<void> => {
  try {
    const capsules = await capsuleService.getAllCapsules();
    handleResponse(res, 200, "Capsules retrieved", capsules);
  } catch (error) {
    handleResponse(res, 500, "Error fetching capsules", error);
  }
};

export const getCapsulesByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;
    if (!email) {
      handleResponse(res, 400, "Email is required");
      return;
    }
    const capsules = await capsuleService.getCapsulesByRecipientEmail(email as string);
    handleResponse(res, 200, "Capsules retrieved", capsules);
  } catch (error) {
    handleResponse(res, 500, "Error fetching capsules", error);
  }
};

export const updateCapsule = async (req: Request, res: Response): Promise<void> => {
  try {
    const capsule = await capsuleService.updateCapsule(req.params.id, req.body);
    if (!capsule) {
      handleResponse(res, 404, "Capsule not found");
      return;
    }
    handleResponse(res, 200, "Capsule updated", capsule);
  } catch (error) {
    handleResponse(res, 500, "Error updating capsule", error);
  }
};

export const deleteCapsule = async (req: Request, res: Response): Promise<void> => {
  try {
    const capsule = await capsuleService.deleteCapsule(req.params.id);
    if (!capsule) {
      handleResponse(res, 404, "Capsule not found");
      return;
    }
    handleResponse(res, 200, "Capsule deleted");
  } catch (error) {
    handleResponse(res, 500, "Error deleting capsule", error);
  }
};
