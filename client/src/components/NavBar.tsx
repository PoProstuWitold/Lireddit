import React from 'react'
import { Box, Flex, Link } from '@chakra-ui/layout'
import { DarkModeSwitch } from './DarkModeSwitch'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { Button } from '@chakra-ui/button'
import { isServer } from '../utils/isServer'

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {

    const [{fetching: logoutFetching }, logout] = useLogoutMutation()
    const [{data, fetching}] = useMeQuery({
        pause: isServer()
    }) // can be passed option {pause: isServer()} for not srr and vice versa
    let body = null

    if(fetching) {
        //data is fetching

    } else if(!data?.me) {
        //not logged in
        body = (
            <>
                <NextLink href='/login'>
                    <Link color='white' mr={3}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link color='white' mr={3}>Register</Link>
                </NextLink>
                <DarkModeSwitch/>
            </>
        )
    } else {
        //logged in
        body = (
            <Flex align='center'>
                <NextLink href="/create-post">
                    <Button as={Link} mr={4} fontWeight='semibold' color='white'>create post</Button>
                </NextLink>
                <Box fontWeight='semibold' color='white' mr={3}>{data.me.username}</Box>
                <Button 
                    onClick={() => logout()} 
                    color='white' 
                    variant="link" 
                    mr={3}
                    isLoading={logoutFetching}
                    >
                        Logout
                    </Button>
                <DarkModeSwitch/>
            </Flex>
        )
    }

    return (
        <Flex zIndex={1} position="sticky" top={0} bg='#008080' p={4} >
            <Flex maxW={800} align='center' flex={1} margin='auto'>
            <NextLink href='/'>
                    <Link variant="nolink" color='white' mr={3}>
                        <Box as='button' textDecoration='none' color='white' fontWeight='bold' letterSpacing={4} mr={4} textShadow="2px 2px #1A202C">Logo</Box>
                    </Link>
            </NextLink>
            <Box ml='auto' minHeight='2rem'>
               {body}
            </Box>
            </Flex>
        </Flex>
    )
}