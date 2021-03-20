import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
import theme from '../theme'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ChakraProvider>
  )
}

export default MyApp
