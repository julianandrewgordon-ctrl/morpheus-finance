import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import App from './App.jsx'
import '@mantine/core/styles.css'
import './index.css'

const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'Inter, system-ui, sans-serif',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
