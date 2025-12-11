import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { CardanoWalletProvider } from '../contexts/CardanoWalletContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CardanoWalletProvider>
          <Component {...pageProps} />
        </CardanoWalletProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}