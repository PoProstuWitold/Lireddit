import { Box, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react'
import { useField } from 'formik'
import React from 'react'

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
    name: string
}

export const InputField: React.FC<InputFieldProps> = ({
        label,
        size: _,
        ...props
    }) => {

    const [ field, { error, touched } ] = useField(props)

    return (
        <Box mt={2}>
            <FormControl isInvalid={error && touched}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Input {...field} {...props} id={field.name}/>
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
            </FormControl>
        </Box>
    )
}