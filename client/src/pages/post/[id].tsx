import { Box, Heading } from '@chakra-ui/layout'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { Layout } from '../../components/Layout'
import { usePostQuery } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl'
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons'

const Post: React.FC<{}> = ({}) => {

    const router = useRouter()
    const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1

    const [{ data, error, fetching }] = useGetPostFromUrl()

    if (fetching) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        )
    }

    if (error) {
        return <div>{error.message}</div>
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        )
    }

    return (
        <Layout>
            <Heading mb={4}>{data.post.title}</Heading>
            <Box mb={4}>{data.post.text}</Box>
            <Box mb={6}>Author: {data.post.creator.username}</Box>
            <EditDeletePostButtons
                id={data.post.id}
                creatorId={data.post.creator.id}
            />
        </Layout>
    )

}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)