import { Box } from '@chakra-ui/layout'
import React from 'react'

interface WrapperProps {
    variant?: 'small' | 'regular'
}

export const Wrapper: React.FC<WrapperProps> = ({ 
    children,
    variant = 'regular'
    }) => {

    return (
        <Box
            mt={10}
            mx='auto'
            maxW={variant === 'regular' ? '800px' : '400px'}
            w='100%'
        >
            {children}
        </Box>
    )
}