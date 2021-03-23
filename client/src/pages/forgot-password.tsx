import React, { useState } from 'react'
import { NavBar } from '../components/NavBar'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import { Box, Button } from '@chakra-ui/react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'

interface forgotPassword {

}

const forgotPassword: React.FC<{}> = ({}) => {

    const [, forgotPassword] = useForgotPasswordMutation()

    const [complete, setComplete] = useState(false)

    return (
        <>
        <NavBar/>
        <Wrapper variant='small'>
            <Formik 
                initialValues={{ email: ""}}
                onSubmit={async (values) => {
                    await forgotPassword(values)
                    setComplete(true)
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string()
                        .required("Email is required")
                        .email()
                })}
            >
            {({ isSubmitting }) => 
                complete ? (
                    <Box>
                        If provided email exists in our database, we sent you an email
                    </Box>
                ) : (
                    <Form>
                        <InputField name='email' label='Email' placeholder='email'/>
                        <Box mt={6}>
                            <Button mt={4}
                                type="submit"
                                isLoading={isSubmitting}
                                variantColor="teal"
                            >
                            Send recovery email
                            </Button>
                        </Box>
                </Form>
                )
            }
            </Formik>
        </Wrapper>
        </>
    )
}

export default withUrqlClient(createUrqlClient)(forgotPassword)