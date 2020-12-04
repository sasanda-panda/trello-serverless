import Amplify from '@aws-amplify/core'
import API from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub'
import awsconfig from '../aws-exports'
import { AppProps } from 'next/app'
import '../styles/globals.scss'

Amplify.configure(awsconfig)
API.configure(awsconfig)
PubSub.configure(awsconfig)

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
