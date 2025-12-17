import { useState } from 'react'
import { Paper, Title, Text, Group, Button, Stack, SimpleGrid, Textarea, Alert, Notification, Box } from '@mantine/core'

export default function Export({ data, onImportData }) {
  const [importText, setImportText] = useState('')
  const [notification, setNotification] = useState(null)

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `morpheus-finance-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    showNotification('success', 'Data exported successfully!')
  }

  const handleCopyToClipboard = () => {
    const dataStr = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(dataStr)
    showNotification('success', 'Data copied to clipboard!')
  }

  const handleImport = () => {
    try {
      const importedData = JSON.parse(importText)
      
      if (!importedData.recurringRules || !importedData.scenarios) {
        throw new Error('Invalid data format')
      }
      
      onImportData(importedData)
      
      showNotification('success', 'Data imported successfully!')
      setImportText('')
    } catch (error) {
      showNotification('error', `Import failed: ${error.message}. Please check your data format.`)
    }
  }

  const dataStats = {
    rules: data.recurringRules?.length || 0,
    scenarios: data.scenarios?.length || 0,
    historicalEntries: data.historicalCashFlows?.length || 0,
    startingBalance: data.startingBalance || 0
  }

  return (
    <>
      {notification && (
        <Notification 
          color={notification.type === 'success' ? 'green' : 'red'}
          onClose={() => setNotification(null)}
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}
        >
          {notification.message}
        </Notification>
      )}

      <Stack gap="lg">
        <Title order={1}>Export & Import Data</Title>
        
        <Paper p="md" withBorder>
          <Title order={3} mb="md">Current Data Summary</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Box>
              <Text size="sm" c="dimmed">Recurring Rules</Text>
              <Title order={2}>{dataStats.rules}</Title>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Scenarios</Text>
              <Title order={2}>{dataStats.scenarios}</Title>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Historical Entries</Text>
              <Title order={2}>{dataStats.historicalEntries}</Title>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Starting Balance</Text>
              <Title order={2}>${dataStats.startingBalance.toLocaleString()}</Title>
            </Box>
          </SimpleGrid>
        </Paper>

        <Paper p="md" withBorder>
          <Title order={3} mb="xs">Export Data</Title>
          <Text size="sm" c="dimmed" mb="md">Download your financial data as a backup file</Text>
          
          <Stack gap="md">
            <Alert color="blue">
              Export creates a JSON file containing all your rules, scenarios, balances, and settings. 
              Keep this file safe as a backup or to transfer data between devices.
            </Alert>
            
            <Group>
              <Button onClick={handleExport}>Download Backup File</Button>
              <Button variant="light" onClick={handleCopyToClipboard}>Copy to Clipboard</Button>
            </Group>

            <Text size="sm" c="dimmed">
              <strong>What's included:</strong>
              <ul>
                <li>All recurring rules and payment schedules</li>
                <li>All scenarios and their configurations</li>
                <li>Starting balance and date</li>
                <li>Historical cash flow entries</li>
                <li>User preferences</li>
              </ul>
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Title order={3} mb="xs">Import Data</Title>
          <Text size="sm" c="dimmed" mb="md">Restore data from a backup file</Text>
          
          <Stack gap="md">
            <Alert color="yellow">
              <strong>Warning:</strong> Importing will replace ALL your current data. 
              Make sure to export your current data first if you want to keep it.
            </Alert>

            <Stack gap="xs">
              <Text>Paste the contents of your backup JSON file below:</Text>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your exported JSON data here..."
                minRows={10}
              />
            </Stack>

            <Button 
              onClick={handleImport}
              disabled={!importText.trim()}
            >
              Import Data
            </Button>

            <Text size="xs" c="dimmed">
              <strong>How to import:</strong>
              <ol>
                <li>Open your backup JSON file in a text editor</li>
                <li>Copy all the contents (Ctrl+A, Ctrl+C)</li>
                <li>Paste into the text area above</li>
                <li>Click "Import Data"</li>
              </ol>
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Title order={3} mb="md">Backup Best Practices</Title>
          <Stack gap="xs">
            <Text>💾 <strong>Regular Backups:</strong> Export your data weekly or after making significant changes</Text>
            <Text>📁 <strong>Multiple Copies:</strong> Keep backups in different locations (cloud storage, external drive)</Text>
            <Text>📅 <strong>Date Your Files:</strong> The export automatically includes the date in the filename</Text>
            <Text>🔒 <strong>Secure Storage:</strong> Your financial data is sensitive - store backups securely</Text>
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}
