import { Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'
import * as Yup from 'yup'
import { useCreatePostMutation } from '../generated/graphql'
import { Layout } from '../components/Layout'
import { useIsAuth } from '../utils/useIsAuth'

const CreatePost: React.FC<{}> = ({}) => {

    const [, createPost] = useCreatePostMutation()

    const router = useRouter()

    useIsAuth()

    return (
        <>
            <Layout variant='small'>
            <Formik 
                initialValues={{ title: '', text: '' }}
                onSubmit={async (values, { setErrors }) => {
                    let response = await createPost({ input: values})

                    if(response.data?.createPost.errors) {
                        setErrors(toErrorMap(response.data.createPost.errors))
                    } else if (response.data?.createPost.post) {
                        // worked
                        router.push('/')
                    }
                }}
                validationSchema={Yup.object().shape({
                    title: Yup.string()
                        .min(2, "Post title must contain at least 2 characters")
                        .required("Post title is required"),
                        text: Yup.string()
                        .min(2, "Post body must contain at least 2 characters")
                        .required("Post body is required")
                })}
            >
            {({ isSubmitting }) => (
                <Form>
                    <InputField name='title' label='Title' placeholder='title...'/>
                    <InputField name='text' label='Body' placeholder='text...' textarea/>
                    <Box mt={6}>
                        <Button type='submit' bg='teal' color='white' isLoading={isSubmitting}>Create post</Button>
                    </Box>
                </Form>
            )}
            </Formik>
            </Layout>
        </>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost)