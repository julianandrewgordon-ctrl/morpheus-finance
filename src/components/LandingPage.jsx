import { useState } from 'react'
import Box from '@cloudscape-design/components/box'
import Button from '@cloudscape-design/components/button'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import ColumnLayout from '@cloudscape-design/components/column-layout'
import Icon from '@cloudscape-design/components/icon'
import FormField from '@cloudscape-design/components/form-field'
import Input from '@cloudscape-design/components/input'
import Alert from '@cloudscape-design/components/alert'

export default function LandingPage({ onEnter }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setError('')
    setIsLoading(true)
    
    // Simple validation - you can replace with real authentication
    setTimeout(() => {
      const trimmedUsername = username.trim().toLowerCase()
      const trimmedPassword = password.trim()
      
      if (username.trim() === '' || password.trim() === '') {
        setError('Please enter both username and password')
        setIsLoading(false)
      } else if (trimmedUsername === 'julian.jonea.gordon@gmail.com' && trimmedPassword === 'Gratitude1') {
        // Julian's account - loads existing data
        handleEnter('julian')
      } else if (trimmedUsername === 'admin' && trimmedPassword === 'admin') {
        // Admin account - blank slate
        handleEnter('admin')
      } else {
        setError(`Invalid username or password. You entered: "${trimmedUsername}"`)
        setIsLoading(false)
      }
    }, 500)
  }

  const handleEnter = (loggedInUsername) => {
    setIsAnimating(true)
    setTimeout(() => {
      onEnter(loggedInUsername)
    }, 800)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <>
      {/* Global style to make containers dark */}
      <style>{`
        .landing-page-container .awsui-container {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      
      <div className="landing-page-container" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'opacity 0.8s ease-out',
        opacity: isAnimating ? 0 : 1,
        background: 'linear-gradient(135deg, #1a0033 0%, #2d1b4e 50%, #1a0033 100%)',
        padding: '2rem'
      }}>
        {/* Morpheus Background Image */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          zIndex: 0
        }}>
          <img 
            src="/Morpheus_brandingA.png" 
            alt="Morpheus Background"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.15,
              filter: 'blur(3px)'
            }}
          />
        </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '1200px'
      }}>
        <SpaceBetween size="xxl">
          {/* Hero Section */}
          <div style={{
            background: 'rgba(10, 0, 21, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 0 40px rgba(138, 43, 226, 0.3)'
          }}>
            <Container>
              <SpaceBetween size="l">
                <div style={{ textAlign: 'center' }}>
                  <Box variant="h1" fontSize="display-l" padding={{ bottom: 's' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #8a2be2 0%, #da70d6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: 'bold',
                      letterSpacing: '0.1em',
                      textShadow: '0 0 40px rgba(138, 43, 226, 0.6)'
                    }}>
                      🔮 MORPHEUS
                    </span>
                  </Box>
                  <Box variant="h2" fontSize="heading-xl" padding={{ bottom: 'm' }}>
                    <span style={{ color: '#e0d0ff' }}>See the Future of Your Finances</span>
                  </Box>
                  <Box variant="p" fontSize="heading-m" padding={{ bottom: 'l' }}>
                    <span style={{ color: '#b19cd9' }}>Scenario-based financial planning with powerful insights</span>
                  </Box>
                </div>

                {/* Login Form */}
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <SpaceBetween size="m">
                    {error && (
                      <Alert type="error" dismissible onDismiss={() => setError('')}>
                        {error}
                      </Alert>
                    )}
                    
                    <FormField label={<span style={{ color: '#e0d0ff' }}>Username</span>}>
                      <Input
                        value={username}
                        onChange={({ detail }) => setUsername(detail.value)}
                        placeholder="Enter username"
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                      />
                    </FormField>

                    <FormField label={<span style={{ color: '#e0d0ff' }}>Password</span>}>
                      <Input
                        value={password}
                        onChange={({ detail }) => setPassword(detail.value)}
                        placeholder="Enter password"
                        type="password"
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                      />
                    </FormField>

                    <div style={{ textAlign: 'center' }}>
                      <Button
                        variant="primary"
                        onClick={handleLogin}
                        iconAlign="right"
                        iconName="angle-right"
                        loading={isLoading}
                        fullWidth
                      >
                        Sign In
                      </Button>
                    </div>

                    <Box textAlign="center" variant="small">
                      <span style={{ color: '#9370db' }}>
                        Admin account: admin/admin (blank slate)
                      </span>
                    </Box>
                  </SpaceBetween>
                </div>
              </SpaceBetween>
            </Container>
          </div>

          {/* Features Section */}
          <div style={{
            background: 'rgba(10, 0, 21, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 0 40px rgba(138, 43, 226, 0.3)'
          }}>
            <Container
              header={
                <Header variant="h2">
                  <span style={{ color: '#e0d0ff' }}>Key Features</span>
                </Header>
              }
            >
              <ColumnLayout columns={3} variant="text-grid">
                <div>
                  <SpaceBetween size="xs">
                    <Box fontSize="display-l">📊</Box>
                    <Box variant="h3" fontSize="heading-m">
                      <span style={{ color: '#e0d0ff' }}>Multi-Scenario Planning</span>
                    </Box>
                    <Box variant="p">
                      <span style={{ color: '#b19cd9' }}>
                        Create and compare multiple financial scenarios to see how different decisions impact your future
                      </span>
                    </Box>
                  </SpaceBetween>
                </div>
                <div>
                  <SpaceBetween size="xs">
                    <Box fontSize="display-l">💰</Box>
                    <Box variant="h3" fontSize="heading-m">
                      <span style={{ color: '#e0d0ff' }}>Cash Flow Projection</span>
                    </Box>
                    <Box variant="p">
                      <span style={{ color: '#b19cd9' }}>
                        365-day forecasting with recurring rules, payment schedules, and historical data integration
                      </span>
                    </Box>
                  </SpaceBetween>
                </div>
                <div>
                  <SpaceBetween size="xs">
                    <Box fontSize="display-l">📈</Box>
                    <Box variant="h3" fontSize="heading-m">
                      <span style={{ color: '#e0d0ff' }}>Visual Analytics</span>
                    </Box>
                    <Box variant="p">
                      <span style={{ color: '#b19cd9' }}>
                        Interactive charts and tables that make complex financial data easy to understand
                      </span>
                    </Box>
                  </SpaceBetween>
                </div>
              </ColumnLayout>
            </Container>
          </div>

          {/* Additional Features */}
          <div style={{
            background: 'rgba(10, 0, 21, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 0 40px rgba(138, 43, 226, 0.3)'
          }}>
            <Container
              header={
                <Header variant="h2">
                  <span style={{ color: '#e0d0ff' }}>What You Can Do</span>
                </Header>
              }
            >
              <ColumnLayout columns={2} variant="text-grid">
                <SpaceBetween size="s">
                  <Box>
                    <span style={{ color: '#b19cd9' }}>
                      <Icon name="check" variant="success" /> <strong>Recurring Rules</strong> - Set up income and expenses that repeat automatically
                    </span>
                  </Box>
                  <Box>
                    <span style={{ color: '#b19cd9' }}>
                      <Icon name="check" variant="success" /> <strong>Payment Schedules</strong> - Handle multi-phase payments with changing amounts
                    </span>
                  </Box>
                  <Box>
                    <span style={{ color: '#b19cd9' }}>
                      <Icon name="check" variant="success" /> <strong>Historical Data</strong> - Import past transactions for accurate projections
                    </span>
                  </Box>
                </SpaceBetween>
                <SpaceBetween size="s">
                  <Box>
                    <span style={{ color: '#b19cd9' }}>
                      <Icon name="check" variant="success" /> <strong>Scenario Comparison</strong> - Visualize multiple futures side-by-side
                    </span>
                  </Box>
                  <Box>
                    <span style={{ color: '#b19cd9' }}>
                      <Icon name="check" variant="success" /> <strong>Data Export</strong> - Backup and export your financial data anytime
                    </span>
                  </Box>
                  <Box>
                    <span style={{ color: '#b19cd9' }}>
                      <Icon name="check" variant="success" /> <strong>Real-time Updates</strong> - See changes reflected instantly across all views
                    </span>
                  </Box>
                </SpaceBetween>
              </ColumnLayout>
            </Container>
          </div>
        </SpaceBetween>
      </div>
    </div>
    </>
  )
}
