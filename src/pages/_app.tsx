import Amplify from '@aws-amplify/core'
import API from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub'
import Auth from '@aws-amplify/auth'
import awsconfig from '../aws-exports'
import { useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import '../styles/globals.scss'
import Navigation from '../components/organisms/Navigation'

Amplify.configure(awsconfig)
API.configure(awsconfig)
PubSub.configure(awsconfig)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="container">
      <Navigation />
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
