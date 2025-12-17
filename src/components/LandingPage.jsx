import { useState, useEffect } from 'react'
import { Container, Paper, Title, Text, Tabs, TextInput, PasswordInput, Button, Stack, Alert, Group, SimpleGrid, Box, Center } from '@mantine/core'
import { supabase } from '../lib/supabase'

export default function LandingPage({ onEnter }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const [showResetForm, setShowResetForm] = useState(false)
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false)

  // Check for password reset token in URL on mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    
    if (accessToken && type === 'recovery') {
      setShowNewPasswordForm(true)
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

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

  const handleSetNewPassword = async () => {
    setError('')
    setSuccess('')
    
    if (!password) {
      setError('Please enter a new password')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) throw error
      
      setSuccess('Password updated successfully! You can now sign in.')
      setShowNewPasswordForm(false)
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError(error.message || 'Failed to update password')
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

  const features = [
    { icon: '📊', title: 'Multi-Scenario Planning', desc: 'Create and compare multiple financial scenarios to see how different decisions impact your future' },
    { icon: '💰', title: 'Cash Flow Projection', desc: '365-day forecasting with recurring rules, payment schedules, and historical data integration' },
    { icon: '📈', title: 'Visual Analytics', desc: 'Interactive charts and tables that make complex financial data easy to understand' }
  ]

  const capabilities = [
    { title: 'Recurring Rules', desc: 'Set up income and expenses that repeat automatically' },
    { title: 'Payment Schedules', desc: 'Handle multi-phase payments with changing amounts' },
    { title: 'Historical Data', desc: 'Import past transactions for accurate projections' },
    { title: 'Scenario Comparison', desc: 'Visualize multiple futures side-by-side' },
    { title: 'Data Export', desc: 'Backup and export your financial data anytime' },
    { title: 'Real-time Updates', desc: 'See changes reflected instantly across all views' }
  ]

  return (
    <Box
      style={{
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
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '100vh',
          zIndex: 0
        }}
      >
        <img 
          src="/Morpheus_brandingA.png" 
          alt="Morpheus Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.15,
            filter: 'blur(3px)'
          }}
        />
      </Box>

      <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
        <Stack gap="xl">
          <Paper 
            p="xl" 
            radius="lg"
            style={{
              background: 'rgba(10, 0, 21, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              boxShadow: '0 0 40px rgba(138, 43, 226, 0.3)'
            }}
          >
            <Stack gap="lg" align="center">
              <Box ta="center">
                <Title 
                  order={1} 
                  style={{
                    background: 'linear-gradient(135deg, #8a2be2 0%, #da70d6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.1em',
                    fontSize: '2.5rem'
                  }}
                >
                  🔮 MORPHEUS
                </Title>
                <Title order={2} c="grape.2" mt="sm">See the Future of Your Finances</Title>
                <Text c="grape.4" size="lg" mt="xs">Scenario-based financial planning with powerful insights</Text>
              </Box>

              <Box w="100%" maw={400}>
                <Stack gap="md">
                  {error && (
                    <Alert color="red" withCloseButton onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert color="green" withCloseButton onClose={() => setSuccess('')}>
                      {success}
                    </Alert>
                  )}
                  
                  {showNewPasswordForm ? (
                    <Stack gap="md">
                      <Title order={3} c="grape.2" ta="center">Set New Password</Title>
                      <Text c="grape.4" size="sm" ta="center">
                        Enter your new password below.
                      </Text>
                      
                      <PasswordInput
                        label={<Text c="grape.2">New Password</Text>}
                        description="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={isLoading}
                      />
                      
                      <PasswordInput
                        label={<Text c="grape.2">Confirm Password</Text>}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        onKeyPress={(e) => e.key === 'Enter' && handleSetNewPassword()}
                        disabled={isLoading}
                      />
                      
                      <Stack gap="xs">
                        <Button
                          fullWidth
                          loading={isLoading}
                          onClick={handleSetNewPassword}
                        >
                          Update Password
                        </Button>
                        <Button
                          variant="subtle"
                          onClick={() => {
                            setShowNewPasswordForm(false)
                            setPassword('')
                            setConfirmPassword('')
                            setError('')
                          }}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                  <Tabs value={activeTab} onChange={(v) => { setActiveTab(v); setError(''); setSuccess(''); }}>
                    <Tabs.List grow>
                      <Tabs.Tab value="signin">Sign In</Tabs.Tab>
                      <Tabs.Tab value="signup">Sign Up</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="signin" pt="md">
                      {showResetForm ? (
                        <Stack gap="md">
                          <Text c="grape.4" size="sm">
                            Enter your email address and we'll send you a link to reset your password.
                          </Text>
                          
                          <TextInput
                            label={<Text c="grape.2">Email</Text>}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            type="email"
                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordReset()}
                            disabled={isLoading}
                          />

                          <Stack gap="xs">
                            <Button
                              fullWidth
                              loading={isLoading}
                              onClick={handlePasswordReset}
                            >
                              Send Reset Link
                            </Button>
                            <Button
                              variant="subtle"
                              onClick={() => {
                                setShowResetForm(false)
                                setError('')
                              }}
                              disabled={isLoading}
                            >
                              Back to Sign In
                            </Button>
                          </Stack>
                        </Stack>
                      ) : (
                        <Stack gap="md">
                          <TextInput
                            label={<Text c="grape.2">Email</Text>}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            type="email"
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                          />

                          <PasswordInput
                            label={<Text c="grape.2">Password</Text>}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                          />

                          <Stack gap="xs">
                            <Button
                              fullWidth
                              loading={isLoading}
                              onClick={handleSignIn}
                              rightSection={<span>→</span>}
                            >
                              Sign In
                            </Button>
                            <Button
                              variant="subtle"
                              onClick={() => {
                                setShowResetForm(true)
                                setError('')
                                setSuccess('')
                              }}
                            >
                              Forgot Password?
                            </Button>
                          </Stack>
                        </Stack>
                      )}
                    </Tabs.Panel>

                    <Tabs.Panel value="signup" pt="md">
                      <Stack gap="md">
                        <TextInput
                          label={<Text c="grape.2">Email</Text>}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          type="email"
                          onKeyPress={handleKeyPress}
                          disabled={isLoading}
                        />

                        <PasswordInput
                          label={<Text c="grape.2">Password</Text>}
                          description="Minimum 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create password"
                          onKeyPress={handleKeyPress}
                          disabled={isLoading}
                        />

                        <Button
                          fullWidth
                          loading={isLoading}
                          onClick={handleSignUp}
                          rightSection={<span>→</span>}
                        >
                          Create Account
                        </Button>
                      </Stack>
                    </Tabs.Panel>
                  </Tabs>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper 
            p="xl" 
            radius="lg"
            style={{
              background: 'rgba(10, 0, 21, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              boxShadow: '0 0 40px rgba(138, 43, 226, 0.3)'
            }}
          >
            <Title order={2} c="grape.2" mb="lg">Key Features</Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              {features.map((feature, idx) => (
                <Box key={idx} ta="center">
                  <Text size="3rem" mb="xs">{feature.icon}</Text>
                  <Title order={4} c="grape.2">{feature.title}</Title>
                  <Text c="grape.4" size="sm">{feature.desc}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Paper>

          <Paper 
            p="xl" 
            radius="lg"
            style={{
              background: 'rgba(10, 0, 21, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              boxShadow: '0 0 40px rgba(138, 43, 226, 0.3)'
            }}
          >
            <Title order={2} c="grape.2" mb="lg">What You Can Do</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {capabilities.map((cap, idx) => (
                <Group key={idx} gap="xs" wrap="nowrap">
                  <Text c="green">✓</Text>
                  <Text c="grape.4">
                    <strong style={{ color: '#e0d0ff' }}>{cap.title}</strong> - {cap.desc}
                  </Text>
                </Group>
              ))}
            </SimpleGrid>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}
