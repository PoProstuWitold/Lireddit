import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import { 
    PostSnippetFragment, 
    // PostsQuery,
    useVoteMutation
} from '../generated/graphql'

interface UpdootSectionProps {
    post: PostSnippetFragment //either PostSnippetFragment or PostsQuery["posts"]["posts"][0]
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState<
        'updoot-loading' | 'downdoot-loading' | 'not-loading'
    >('not-loading')
    const [, vote] = useVoteMutation()
    
    return (
        <Flex direction='column' justifyContent='center' alignItems='center' mr={4}>
                <IconButton
                    onClick={async () => {
                        setLoadingState('updoot-loading')
                        await vote({
                            postId: post.id,
                            value: 1
                        })
                        setLoadingState('not-loading')
                    }}
                    bgColor={post.voteStatus === 1 ? 'green' : undefined}
                    isLoading={loadingState === 'updoot-loading'}
                    aria-label="Vote up"
                    icon={<ChevronUpIcon w={30} h={30}/>}
                />
                {post.points}
                <IconButton
                    onClick={async () => {
                        setLoadingState('downdoot-loading')
                        await vote({
                            postId: post.id,
                            value: -1
                        })
                        setLoadingState('not-loading')
                    }}
                    
                    bgColor={post.voteStatus === -1 ? 'red' : undefined}
                    isLoading={loadingState === 'downdoot-loading'}
                    aria-label="Vote down"
                    icon={<ChevronDownIcon w={30} h={30}/>}
                />
        </Flex>

    )
}