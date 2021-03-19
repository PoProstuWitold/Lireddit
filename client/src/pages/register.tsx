import React from 'react'
import { Formik, Form } from 'formik'
import { Wrapper } from '../components/Wrapper'
import { DarkModeSwitch } from '../components/DarkModeSwitch'
import { Container } from '../components/Container'
import { InputField } from '../components/InputField'
import { Button } from '@chakra-ui/button'
import { Box } from '@chakra-ui/layout'

interface registerProps {
    
}


const Register: React.FC<registerProps> = ({}) => {
    return (
    <Container height="100vh">
       <Wrapper variant='small'>
            <Formik 
                initialValues={{ username: '', password: '' }}
                onSubmit={async values => { 
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    console.log(values)
                }}
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