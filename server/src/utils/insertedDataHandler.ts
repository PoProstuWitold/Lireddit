import { ObjectSchema } from 'joi'
import { FieldError } from '../resolvers/user'

const insertedDataHandler = (schema: ObjectSchema, data: any) => {
    //@ts-ignore
    const { value, error } = schema.validate(data, { abortEarly: false })

    let validationErrors: Array<FieldError> = []

    if(error?.details) {
        for (const key of error!.details) {
            validationErrors.push({
                field: key.path.toString(),
                message: key.message
            })
            // console.log('field', key.path.toString())
            // console.log('message', key.message)
            // console.log(error.details)
        }
    }

    if(validationErrors.length) {
        return validationErrors
    }
    

    return null
    
}

export default insertedDataHandler
