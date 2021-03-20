import Joi, { StringSchema } from 'joi'

// const email: StringSchema = Joi.string().email().required()
const username: StringSchema = Joi.string().required().min(3).max(100)
const password: StringSchema = Joi.string().required().min(3).max(50)

const registerSchema = Joi.object({
    username: username,
    password: password  
})

export { registerSchema }