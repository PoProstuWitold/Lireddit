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
    })
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
            <Flex>
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
        <Flex bg='#2E8B57' p={4}>
            <Box ml='auto' minHeight='2rem'>
               {body}
            </Box>
        </Flex>
    )
}