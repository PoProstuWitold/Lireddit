import React from 'react'
import { Formik, Form } from 'formik'
import { Wrapper } from '../components/Wrapper'
import { DarkModeSwitch } from '../components/DarkModeSwitch'
import { Container } from '../components/Container'
import { InputField } from '../components/InputField'
import { Button } from '@chakra-ui/button'
import { Box } from '@chakra-ui/layout'
import * as Yup from 'yup'
import { useRegisterMutation } from '../generated/graphql'
// import { useMutation } from 'urql'

interface registerProps {
    
}

// const RegisterMutation = `
// mutation Register($username: String!, $password:String!){
//     register(options: { username: $username, password: $password }) {
//       errors {
//         field
//         message
//       }
//       user {
//         id
//         username
//       }
//     }
//   }
  
// `

const Register: React.FC<registerProps> = ({}) => {
    
    // const [, register] = useMutation(RegisterMutation)
    const [, register] = useRegisterMutation()

    return (
    <Container height="100vh">
       <Wrapper variant='small'>
            <Formik 
                initialValues={{ username: '', password: '' }}
                onSubmit={async (values) => {
                    const response = await register(values)
                    console.log(response)
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
                        <Button type='submit' bg='teal' color='white' isLoading={isSubmitting}>Register</Button>
                    </Box>
                </Form>
            )}
            </Formik>
        <DarkModeSwitch/>
        </Wrapper>
    </Container>
    )
}

export default Register