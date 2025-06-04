import Joi from "joi";

export const authSchemas = {
  register: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .required()
      .lowercase()
      .trim()
      .max(255)
      .messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),

    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .trim()
      .messages({
        "string.alphanum": "Username must contain only letters and numbers",
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot exceed 30 characters",
        "any.required": "Username is required",
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
        )
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),

    firstName: Joi.string()
      .min(1)
      .max(50)
      .required()
      .trim()
      .pattern(/^[a-zA-Z\s'-]+$/)
      .messages({
        "string.pattern.base":
          "First name can only contain letters, spaces, hyphens, and apostrophes",
        "any.required": "First name is required",
      }),

    lastName: Joi.string()
      .min(1)
      .max(50)
      .required()
      .trim()
      .pattern(/^[a-zA-Z\s'-]+$/)
      .messages({
        "string.pattern.base":
          "Last name can only contain letters, spaces, hyphens, and apostrophes",
        "any.required": "Last name is required",
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().lowercase().trim().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "Refresh token is required",
    }),
  }),

  logout: Joi.object({
    sessionId: Joi.string().optional().allow(""),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z\s'-]+$/)
      .optional()
      .messages({
        "string.pattern.base":
          "First name can only contain letters, spaces, hyphens, and apostrophes",
      }),

    lastName: Joi.string()
      .min(1)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z\s'-]+$/)
      .optional()
      .messages({
        "string.pattern.base":
          "Last name can only contain letters, spaces, hyphens, and apostrophes",
      }),

    bio: Joi.string().max(500).trim().optional().allow("").messages({
      "string.max": "Bio cannot exceed 500 characters",
    }),

    avatar: Joi.string().uri().optional().allow("").messages({
      "string.uri": "Avatar must be a valid URL",
    }),

    preferences: Joi.object({
      theme: Joi.string().valid("light", "dark").optional(),
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
      }).optional(),
      language: Joi.string().min(2).max(5).optional(),
      timezone: Joi.string().optional(),
    }).optional(),
  }).min(1), // At least one field must be provided
};
