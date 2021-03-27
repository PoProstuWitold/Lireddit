import { Box, FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react'
import { useField } from 'formik'
import React from 'react'

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
    name: string,
    textarea?: boolean
}

export const InputField: React.FC<InputFieldProps> = ({
        label,
        textarea,
        size: _,
        ...props
    }) => {
    
    let InputOrTextarea = Input

    if(textarea) {
        //@ts-ignore
        InputOrTextarea = Textarea
    }

    const [ field, { error, touched } ] = useField(props)

    return (
        <Box mt={2}>
            <FormControl isInvalid={!!error && touched}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <InputOrTextarea {...field} {...props} id={field.name}/>
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
            </FormControl>
        </Box>
    )
}