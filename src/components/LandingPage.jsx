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
import Tabs from '@cloudscape-design/components/tabs'
import { supabase } from '../lib/supabase'

export default function LandingPage({ onEnter }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const [showResetForm, setShowResetForm] = useState(false)

  const handleSignIn = async () => {
    setError('')
    setSuccess('')
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })
      
      if (error) throw error
      
      if (data.user) {
        handleEnter(data.user)
      }
    } catch (error) {
      setError(error.message || 'Failed to sign in')
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    setError('')
    setSuccess('')
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password
      })
      
      if (error) throw error
      
      if (data.user) {
        setSuccess('Account created successfully! Signing you in...')
        // Auto sign in after signup
        setTimeout(() => {
          handleEnter(data.user)
        }, 1000)
      }
    } catch (error) {
      setError(error.message || 'Failed to create account')
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setError('')
    setSuccess('')
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      })
      
      if (error) throw error
      
      setSuccess('Password reset email sent! Check your inbox.')
      setShowResetForm(false)
    } catch (error) {
      setError(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnter = (user) => {
    setIsAnimating(true)
    setTimeout(() => {
      onEnter(user)
    }, 800)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === 'signin') {
        handleSignIn()
      } else {
        handleSignUp()
      }
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

                {/* Login/Signup Form */}
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <SpaceBetween size="m">
                    {error && (
                      <Alert type="error" dismissible onDismiss={() => setError('')}>
                        {error}
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert type="success" dismissible onDismiss={() => setSuccess('')}>
                        {success}
                      </Alert>
                    )}
                    
                    <Tabs
                      activeTabId={activeTab}
                      onChange={({ detail }) => {
                        setActiveTab(detail.activeTabId)
                        setError('')
                        setSuccess('')
                      }}
                      tabs={[
                        {
                          id: 'signin',
                          label: 'Sign In',
                          content: showResetForm ? (
                            <SpaceBetween size="m">
                              <Box variant="p">
                                <span style={{ color: '#b19cd9' }}>
                                  Enter your email address and we'll send you a link to reset your password.
                                </span>
                              </Box>
                              
                              <FormField label={<span style={{ color: '#e0d0ff' }}>Email</span>}>
                                <Input
                                  value={email}
                                  onChange={({ detail }) => setEmail(detail.value)}
                                  placeholder="your@email.com"
                                  type="email"
                                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordReset()}
                                  disabled={isLoading}
                                />
                              </FormField>

                              <div style={{ textAlign: 'center' }}>
                                <SpaceBetween size="s">
                                  <Button
                                    variant="primary"
                                    onClick={handlePasswordReset}
                                    loading={isLoading}
                                    fullWidth
                                  >
                                    Send Reset Link
                                  </Button>
                                  <Button
                                    variant="link"
                                    onClick={() => {
                                      setShowResetForm(false)
                                      setError('')
                                    }}
                                    disabled={isLoading}
                                  >
                                    Back to Sign In
                                  </Button>
                                </SpaceBetween>
                              </div>
                            </SpaceBetween>
                          ) : (
                            <SpaceBetween size="m">
                              <FormField label={<span style={{ color: '#e0d0ff' }}>Email</span>}>
                                <Input
                                  value={email}
                                  onChange={({ detail }) => setEmail(detail.value)}
                                  placeholder="your@email.com"
                                  type="email"
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
                                <SpaceBetween size="s">
                                  <Button
                                    variant="primary"
                                    onClick={handleSignIn}
                                    iconAlign="right"
                                    iconName="angle-right"
                                    loading={isLoading}
                                    fullWidth
                                  >
                                    Sign In
                                  </Button>
                                  <Button
                                    variant="link"
                                    onClick={() => {
                                      setShowResetForm(true)
                                      setError('')
                                      setSuccess('')
                                    }}
                                  >
                                    Forgot Password?
                                  </Button>
                                </SpaceBetween>
                              </div>
                            </SpaceBetween>
                          )
                        },
                        {
                          id: 'signup',
                          label: 'Sign Up',
                          content: (
                            <SpaceBetween size="m">
                              <FormField label={<span style={{ color: '#e0d0ff' }}>Email</span>}>
                                <Input
                                  value={email}
                                  onChange={({ detail }) => setEmail(detail.value)}
                                  placeholder="your@email.com"
                                  type="email"
                                  onKeyPress={handleKeyPress}
                                  disabled={isLoading}
                                />
                              </FormField>

                              <FormField 
                                label={<span style={{ color: '#e0d0ff' }}>Password</span>}
                                constraintText="Minimum 6 characters"
                              >
                                <Input
                                  value={password}
                                  onChange={({ detail }) => setPassword(detail.value)}
                                  placeholder="Create password"
                                  type="password"
                                  onKeyPress={handleKeyPress}
                                  disabled={isLoading}
                                />
                              </FormField>

                              <div style={{ textAlign: 'center' }}>
                                <Button
                                  variant="primary"
                                  onClick={handleSignUp}
                                  iconAlign="right"
                                  iconName="angle-right"
                                  loading={isLoading}
                                  fullWidth
                                >
                                  Create Account
                                </Button>
                              </div>
                            </SpaceBetween>
                          )
                        }
                      ]}
                    />
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
