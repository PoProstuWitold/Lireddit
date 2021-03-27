import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { NextPage } from 'next'
import { InputField } from '../../components/InputField'
import { toErrorMap } from '../../utils/toErrorMap'
import * as Yup from 'yup'
import { PassportField } from '../../components/PassportField'
import { useChangePasswordMutation } from '../../generated/graphql'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import NextLink from 'next/link'
import { withUrqlClient, NextComponentType } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { Layout } from '../../components/Layout'

const ChangePassword: NextPage<{token: string}> = ({token}) => {

    const [, changePassword] = useChangePasswordMutation()

    const router = useRouter()

    const [tokenError, setTokenError] = useState('')

    return (
        <>
        <Layout variant='small'>
            <Formik 
                initialValues={{ newPassword: "", confirmPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token
                    })
                    if(response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors)
                        if ("token" in errorMap) {
                            setTokenError(errorMap.token)
                        }
                        setErrors(errorMap)
                    } else if (response.data?.changePassword.user) {
                        // worked
                        router.push('/')
                    }
                }}
                validationSchema={Yup.object().shape({
                    newPassword: Yup.string()
                        .min(3, "New password must contain at least 2 characters")
                        .max(50)
                        .required("New password is required"),
                    confirmPassword: Yup.string()
                        .oneOf([Yup.ref('newPassword')], "Passwords don't match")
                        .min(3, "Confirm password must contain at least 2 characters")
                        .max(50)
                        .required("Confirm password is required")
                })}
            >
            {({ isSubmitting }) => (
                <Form>
                    <InputField name='newPassword' label='New password' placeholder='new pasword' type='password'/>
                    <PassportField name='confirmPassword' label='Confirm password' placeholder='confirm password'/>
                    {tokenError ? (
                    <Flex>
                        <Box mr={2} color='red'>
                            {tokenError}
                        </Box>
                        <NextLink href="/forgot-password">
                            <Link>click here to get a new one</Link>
                        </NextLink>
                    </Flex>
                    ) : null}
                    <Box mt={6}>
                        <Button type='submit' bg='teal' color='white' isLoading={isSubmitting}>Change password</Button>
                    </Box>
                </Form>
            )}
            </Formik>
        </Layout>
    </>
    );
}

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient)(ChangePassword as unknown as NextComponentType)