import React from 'react'
import { Formik, Form } from 'formik'
import { Wrapper } from '../components/Wrapper'
import { DarkModeSwitch } from '../components/DarkModeSwitch'
import { Container } from '../components/Container'
import { InputField } from '../components/InputField'
import { Button } from '@chakra-ui/button'
import { Box } from '@chakra-ui/layout'
import * as Yup from 'yup'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'


const Login: React.FC<{}> = ({}) => {
    
    const [, login] = useLoginMutation()

    const router = useRouter()

    return (
    <Container height="100vh">
       <Wrapper variant='small'>
            <Formik 
                initialValues={{ username: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({ options: values })
                    if(response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        // worked
                        router.push('/')
                    }
                }}
                validationSchema={Yup.object().shape({
                    username: Yup.string()
                        .min(2, "Username must contain at least 2 characters")
                        .required("Username is required"),
                    password: Yup.string()
                        .min(2, "Password must contain at least 2 characters")
                        .required("Password is required")
                })}
            >
            {({ isSubmitting }) => (
                <Form>
                    <InputField name='username' label='Username' placeholder='username'/>
                    <InputField name='password' label='password' placeholder='password' type='password'/>
                    <Box mt={6}>
                        <Button type='submit' bg='teal' color='white' isLoading={isSubmitting}>Login</Button>
                    </Box>
                </Form>
            )}
            </Formik>
        <DarkModeSwitch/>
        </Wrapper>
    </Container>
    )
}

export default Login