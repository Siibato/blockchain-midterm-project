import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Web3OnboardProvider } from '@web3-onboard/react'
import { onboard } from './web3onboard'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3OnboardProvider web3Onboard={onboard}>
      <App />
    </Web3OnboardProvider>
  </StrictMode>,
)
