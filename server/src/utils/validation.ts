import Joi, { StringSchema } from 'joi'

const email: StringSchema = Joi.string().email().required().max(100)
const username: StringSchema = Joi.string().required().min(3).max(100).regex(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{3,100}$/)
const password: StringSchema = Joi.string().required().min(3).max(50)

const registerSchema = Joi.object({
    email: email,
    username: username,
    password: password  
})

export { registerSchema }