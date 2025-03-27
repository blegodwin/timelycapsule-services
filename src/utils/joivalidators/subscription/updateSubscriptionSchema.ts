import Joi from "joi"

const updateSubscriptionSchema = Joi.object({
  planType: Joi.string().valid("basic", "premium", "enterprise").messages({
    "string.base": "Plan type must be a string",
    "any.only": "Plan type must be one of: basic, premium, enterprise",
  }),
  status: Joi.string().valid("active", "cancelled", "expired", "pending").messages({
    "string.base": "Status must be a string",
    "any.only": "Status must be one of: active, cancelled, expired, pending",
  }),
  paymentMethod: Joi.string().valid("traditional", "web3").messages({
    "string.base": "Payment method must be a string",
    "any.only": "Payment method must be one of: traditional, web3",
  }),
  walletAddress: Joi.string().allow(null, "").messages({
    "string.base": "Wallet address must be a string",
  }),
  price: Joi.number().positive().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be a positive number",
  }),
  currency: Joi.string().messages({
    "string.base": "Currency must be a string",
  }),
  autoRenew: Joi.boolean().messages({
    "boolean.base": "Auto renew must be a boolean",
  }),
  transactionId: Joi.string().allow(null, "").messages({
    "string.base": "Transaction ID must be a string",
  }),
})
  .min(1)
  .options({ stripUnknown: true })

export default updateSubscriptionSchema

