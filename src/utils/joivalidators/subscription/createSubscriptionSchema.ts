import Joi from "joi"

const createSubscriptionSchema = Joi.object({
  planType: Joi.string().valid("basic", "premium", "enterprise").required().messages({
    "string.base": "Plan type must be a string",
    "string.empty": "Plan type is required",
    "any.required": "Plan type is required",
    "any.only": "Plan type must be one of: basic, premium, enterprise",
  }),
  paymentMethod: Joi.string().valid("traditional", "web3").required().messages({
    "string.base": "Payment method must be a string",
    "string.empty": "Payment method is required",
    "any.required": "Payment method is required",
    "any.only": "Payment method must be one of: traditional, web3",
  }),
  walletAddress: Joi.string().when("paymentMethod", {
    is: "web3",
    then: Joi.string().required().messages({
      "string.base": "Wallet address must be a string",
      "string.empty": "Wallet address is required for web3 payment method",
      "any.required": "Wallet address is required for web3 payment method",
    }),
    otherwise: Joi.string().allow(null, ""),
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be a positive number",
    "any.required": "Price is required",
  }),
  currency: Joi.string().default("USD").messages({
    "string.base": "Currency must be a string",
  }),
  autoRenew: Joi.boolean().default(true).messages({
    "boolean.base": "Auto renew must be a boolean",
  }),
  transactionId: Joi.string().allow(null, "").messages({
    "string.base": "Transaction ID must be a string",
  }),
}).options({ stripUnknown: true })

export default createSubscriptionSchema

