import Joi from "joi";

export const createPaymentSchema = Joi.object({
  amount: Joi.number()
    .required()
    .min(0.01)
    .message("Amount must be greater than 0"),
  currency: Joi.string().default("USD"),
  paymentMethod: Joi.string().required(),
  transactionId: Joi.string().required(),
  description: Joi.string().allow("", null),
  metadata: Joi.object().default({}),
});

export const updatePaymentSchema = Joi.object({
  amount: Joi.number().min(0.01).message("Amount must be greater than 0"),
  currency: Joi.string(),
  status: Joi.string().valid("pending", "completed", "failed", "refunded"),
  paymentMethod: Joi.string(),
  transactionId: Joi.string(),
  description: Joi.string().allow("", null),
  metadata: Joi.object(),
}).min(1);

export const updatePaymentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "completed", "failed", "refunded")
    .required(),
});
