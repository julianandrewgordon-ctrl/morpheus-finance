import { useState } from 'react'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Box from '@cloudscape-design/components/box'
import Button from '@cloudscape-design/components/button'
import Textarea from '@cloudscape-design/components/textarea'
import Alert from '@cloudscape-design/components/alert'
import Flashbar from '@cloudscape-design/components/flashbar'
import ColumnLayout from '@cloudscape-design/components/column-layout'

export default function Export({ data, onImportData }) {
  const [importText, setImportText] = useState('')
  const [flashMessages, setFlashMessages] = useState([])

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `morpheus-finance-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    setFlashMessages([{
      type: 'success',
      content: 'Data exported successfully!',
      dismissible: true,
      onDismiss: () => setFlashMessages([])
    }])
  }

  const handleCopyToClipboard = () => {
    const dataStr = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(dataStr)
    setFlashMessages([{
      type: 'success',
      content: 'Data copied to clipboard!',
      dismissible: true,
      onDismiss: () => setFlashMessages([])
    }])
  }

  const handleImport = () => {
    try {
      const importedData = JSON.parse(importText)
      
      // Validate the data structure
      if (!importedData.recurringRules || !importedData.scenarios) {
        throw new Error('Invalid data format')
      }
      
      onImportData(importedData)
      setImportText('')
      setFlashMessages([{
        type: 'success',
        content: 'Data imported successfully! The page will reload.',
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
      
      // Reload after a short delay
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      setFlashMessages([{
        type: 'error',
        content: `Import failed: ${error.message}. Please check your data format.`,
        dismissible: true,
        onDismiss: () => setFlashMessages([])
      }])
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
      <Flashbar items={flashMessages} />
      <SpaceBetween size="l">
        <Header variant="h1">Export & Import Data</Header>
        
        {/* Current Data Summary */}
        <Container
          header={
            <Header variant="h2">
              Current Data Summary
            </Header>
          }
        >
          <ColumnLayout columns={4} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Recurring Rules</Box>
              <Box variant="h1" fontSize="display-l">{dataStats.rules}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Scenarios</Box>
              <Box variant="h1" fontSize="display-l">{dataStats.scenarios}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Historical Entries</Box>
              <Box variant="h1" fontSize="display-l">{dataStats.historicalEntries}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Starting Balance</Box>
              <Box variant="h1" fontSize="display-l">${dataStats.startingBalance.toLocaleString()}</Box>
            </div>
          </ColumnLayout>
        </Container>

        {/* Export Section */}
        <Container
          header={
            <Header
              variant="h2"
              description="Download your financial data as a backup file"
            >
              Export Data
            </Header>
          }
        >
          <SpaceBetween size="m">
            <Alert type="info">
              Export creates a JSON file containing all your rules, scenarios, balances, and settings. 
              Keep this file safe as a backup or to transfer data between devices.
            </Alert>
            
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="primary" iconName="download" onClick={handleExport}>
                Download Backup File
              </Button>
              <Button iconName="copy" onClick={handleCopyToClipboard}>
                Copy to Clipboard
              </Button>
            </SpaceBetween>

            <Box variant="p" color="text-body-secondary">
              <strong>What's included:</strong>
              <ul>
                <li>All recurring rules and payment schedules</li>
                <li>All scenarios and their configurations</li>
                <li>Starting balance and date</li>
                <li>Historical cash flow entries</li>
                <li>User preferences</li>
              </ul>
            </Box>
          </SpaceBetween>
        </Container>

        {/* Import Section */}
        <Container
          header={
            <Header
              variant="h2"
              description="Restore data from a backup file"
            >
              Import Data
            </Header>
          }
        >
          <SpaceBetween size="m">
            <Alert type="warning">
              <strong>Warning:</strong> Importing will replace ALL your current data. 
              Make sure to export your current data first if you want to keep it.
            </Alert>

            <SpaceBetween size="s">
              <Box variant="p">
                Paste the contents of your backup JSON file below:
              </Box>
              <Textarea
                value={importText}
                onChange={({ detail }) => setImportText(detail.value)}
                placeholder='Paste your exported JSON data here...'
                rows={10}
              />
            </SpaceBetween>

            <Button 
              variant="primary" 
              iconName="upload"
              onClick={handleImport}
              disabled={!importText.trim()}
            >
              Import Data
            </Button>

            <Box variant="p" color="text-body-secondary" fontSize="body-s">
              <strong>How to import:</strong>
              <ol>
                <li>Open your backup JSON file in a text editor</li>
                <li>Copy all the contents (Ctrl+A, Ctrl+C)</li>
                <li>Paste into the text area above</li>
                <li>Click "Import Data"</li>
              </ol>
            </Box>
          </SpaceBetween>
        </Container>

        {/* Best Practices */}
        <Container
          header={
            <Header variant="h2">
              Backup Best Practices
            </Header>
          }
        >
          <SpaceBetween size="s">
            <Box variant="p">
              💾 <strong>Regular Backups:</strong> Export your data weekly or after making significant changes
            </Box>
            <Box variant="p">
              📁 <strong>Multiple Copies:</strong> Keep backups in different locations (cloud storage, external drive)
            </Box>
            <Box variant="p">
              📅 <strong>Date Your Files:</strong> The export automatically includes the date in the filename
            </Box>
            <Box variant="p">
              🔒 <strong>Secure Storage:</strong> Your financial data is sensitive - store backups securely
            </Box>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </>
  )
}
