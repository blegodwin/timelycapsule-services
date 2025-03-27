import Joi from 'joi';

const notificationValidationSchema = Joi.object({
    userId: Joi.string(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    contentType: Joi.string().required(),
    isRead: Joi.boolean().default(false),
    createdAt: Joi.date().default(() => new Date()),
    updatedAt: Joi.date().default(() => new Date()),
}).options({ stripUnknown: true });

export default notificationValidationSchema;
