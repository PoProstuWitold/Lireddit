import Joi, { StringSchema } from 'joi'

const email: StringSchema = Joi.string().email().required().max(100)
const username: StringSchema = Joi.string().required().min(3).max(100).regex(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{3,100}$/)
    .messages({
        'string.pattern.base': `Username can contain characters a-z, 0-9, underscores and periods,
            cannot start with a period nor end with a period. It must also not have more than one period sequentially.`
    })
const password: StringSchema = Joi.string().required().min(3).max(50)
const title: StringSchema = Joi.string().required().min(3).max(100)
const text: StringSchema = Joi.string().required().min(3).max(750)


const registerSchema = Joi.object({
    email: email,
    username: username,
    password: password  
})

const postSchema = Joi.object({
    title: title,
    text: text
})

export { registerSchema, postSchema }