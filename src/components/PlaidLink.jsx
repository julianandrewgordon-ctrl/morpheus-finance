import { useState, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Button, Loader } from '@mantine/core'
import { createPlaidLinkToken, exchangePlaidToken } from '../lib/supabase'

export default function PlaidLink({ householdId, onSuccess, onError, buttonText = 'Link Bank Account', variant = 'filled' }) {
  const [linkToken, setLinkToken] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchLinkToken = useCallback(async () => {
    setLoading(true)
    try {
      const token = await createPlaidLinkToken(householdId)
      setLinkToken(token)
    } catch (error) {
      console.error('Error creating link token:', error)
      onError?.(error.message || 'Failed to initialize bank connection')
    } finally {
      setLoading(false)
    }
  }, [householdId, onError])

  const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    setLoading(true)
    try {
      const result = await exchangePlaidToken(publicToken, householdId, metadata)
      onSuccess?.(result)
    } catch (error) {
      console.error('Error exchanging token:', error)
      onError?.(error.message || 'Failed to connect bank account')
    } finally {
      setLoading(false)
      setLinkToken(null)
    }
  }, [householdId, onSuccess, onError])

  const onPlaidExit = useCallback(() => {
    setLinkToken(null)
  }, [])

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  }

  const { open, ready } = usePlaidLink(config)

  const handleClick = async () => {
    if (linkToken && ready) {
      open()
    } else {
      await fetchLinkToken()
    }
  }

  // Auto-open Plaid Link once token is ready
  if (linkToken && ready) {
    open()
  }

  return (
    <Button
      onClick={handleClick}
      loading={loading}
      variant={variant}
      disabled={loading}
    >
      {buttonText}
    </Button>
  )
}
