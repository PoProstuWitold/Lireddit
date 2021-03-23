import React from 'react'
import { Formik, Form } from 'formik'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { Button } from '@chakra-ui/button'
import { Box } from '@chakra-ui/layout'
import * as Yup from 'yup'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'
import { NavBar } from '../components/NavBar'
import NextLink from 'next/link'
import { Flex, Link } from '@chakra-ui/react'

const Login: React.FC<{}> = ({}) => {
    
    const [, login] = useLoginMutation()

    const router = useRouter()

    return (
    <>
    <NavBar/>
       <Wrapper variant='small'>
            <Formik 
                initialValues={{ usernameOrEmail: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login(values)
                    if(response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        // worked
                        router.push('/')
                    }
                }}
                validationSchema={Yup.object().shape({
                    usernameOrEmail: Yup.string()
                        .min(2, "Username or email must contain at least 2 characters")
                        .required("Username or email is required"),
                    password: Yup.string()
                        .min(2, "Password must contain at least 2 characters")
                        .required("Password is required")
                })}
            >
            {({ isSubmitting }) => (
                <Form>
                    <InputField name='usernameOrEmail' label='Username or Email' placeholder='username or email'/>
                    <InputField name='password' label='password' placeholder='password' type='password'/>
                    <Flex mt={4}>
                        <NextLink href="/forgot-password">
                            <Link ml="auto">Forgot password?</Link>
                        </NextLink>
                    </Flex>
                    <Box mt={6}>
                        <Button type='submit' bg='teal' color='white' isLoading={isSubmitting}>Login</Button>
                    </Box>
                </Form>
            )}
            </Formik>
        </Wrapper>
    </>
    )
}

export default withUrqlClient(createUrqlClient)(Login)