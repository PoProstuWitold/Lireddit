import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { usePostsQuery, useDeletePostMutation } from '../generated/graphql'
import { Layout } from '../components/Layout'
import NextLink from 'next/link'
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { UpdootSection } from '../components/UpdootSection'
import { DeleteIcon } from '@chakra-ui/icons'
import { EditDeletePostButtons } from '../components/EditDeletePostButtons'

const Index = () => {

    const [variables, setVariables] = useState({
       limit: 10,
       cursor: null as null | string 
    })
    

    const [, deletePost] = useDeletePostMutation()

    const [{ data, error, fetching }] = usePostsQuery({
      variables
    })

    if (!fetching && !data) {
      return (
        <Box>
          <Heading>Failed to fetch data</Heading>
          <Text>{error?.message}</Text>
        </Box>
      )
    }

    return (
      <>
      <Layout>
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack>
          {data!.posts.posts.map((p) =>
          
          !p ? null : (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p}/>
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                </NextLink>
                <Text>Author: {p.creator.username}</Text>
                <Flex align='center'>
                  <Text flex={1} mt={4}>{p.textSnippet}</Text>
                  <Box ml='auto'>
                    <EditDeletePostButtons
                      id={p.id}
                      creatorId={p.creator.id}
                    />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
          })
        }} isLoading={fetching} m="auto" my={8}>
          load more
        </Button>
      </Flex>
      ) : null

      }
      </Layout>
      </>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
