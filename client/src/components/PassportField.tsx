import { Box, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { useField } from 'formik'
import React from 'react'

type PassportFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
    name: string
}

export const PassportField: React.FC<PassportFieldProps> = ({
        label,
        size: _,
        ...props
    }) => {

    const [ field, { error, touched } ] = useField(props)
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)

    return (
        <Box mt={2}>
            <FormControl isInvalid={!!error && touched}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <InputGroup>
                <Input
                    type={show ? "text" : "password"}
                    {...field} {...props}
                />
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
                </InputGroup>
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
            </FormControl>
        </Box>
    )
}