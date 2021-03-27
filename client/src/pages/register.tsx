import React from 'react'
import { Formik, Form } from 'formik'
import { InputField } from '../components/InputField'
import { Button } from '@chakra-ui/button'
import { Box } from '@chakra-ui/layout'
import * as Yup from 'yup'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'
import { Layout } from '../components/Layout'

interface registerProps {
    
}

const Register: React.FC<registerProps> = ({}) => {
    
    const [, register] = useRegisterMutation()

    const router = useRouter()

    return (
        <>
        <Layout variant='small'>
            <Formik 
                initialValues={{ email: '', username: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({ options: values})
                    if(response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        // worked
                        router.push('/')
                    }
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string()
                        .min(2, "Email must contain at least 2 characters")
                        .required("Email is required")
                        .email("Email must be valid"),
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
                    <InputField name='email' label='Email' placeholder='email'/>
                    <InputField name='username' label='Username' placeholder='username'/>
                    <InputField name='password' label='password' placeholder='password' type='password'/>
                    <Box mt={6}>
                        <Button type='submit' bg='teal' color='white' isLoading={isSubmitting}>Register</Button>
                    </Box>
                </Form>
            )}
            </Formik>
        </Layout>
    </>
    )
}

export default withUrqlClient(createUrqlClient)(Register)