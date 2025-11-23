import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Button from '@cloudscape-design/components/button'
import FormField from '@cloudscape-design/components/form-field'
import Select from '@cloudscape-design/components/select'
import Input from '@cloudscape-design/components/input'
import Checkbox from '@cloudscape-design/components/checkbox'
import DatePicker from '@cloudscape-design/components/date-picker'
import Box from '@cloudscape-design/components/box'
import { useState } from 'react'

export default function Export({ profile }) {
  const [selectedProfile, setSelectedProfile] = useState({ label: profile, value: profile.toLowerCase() })
  const [includeActive, setIncludeActive] = useState(true)
  const [includeInactive, setIncludeInactive] = useState(true)
  const [includeDraft, setIncludeDraft] = useState(true)
  const [includeDescriptions, setIncludeDescriptions] = useState(true)
  const [fromDate, setFromDate] = useState('2025/05/24')
  const [toDate, setToDate] = useState('2025/12/31')
  const [includeDailyTotals, setIncludeDailyTotals] = useState(true)
  const [includeRunningBalance, setIncludeRunningBalance] = useState(true)
  const [includeOverrides, setIncludeOverrides] = useState(true)
  const [includeScenarioData, setIncludeScenarioData] = useState(false)

  const profileOptions = [
    { label: 'Personal', value: 'personal' },
    { label: 'Business', value: 'business' },
    { label: 'Rental Property', value: 'rental' }
  ]

  const handleExportRules = () => {
    alert('Exporting recurring rules to CSV...')
  }

  const handleExportCashFlow = () => {
    alert('Exporting cash flow data to CSV...')
  }

  const handleExportAll = () => {
    alert('Exporting all profiles to ZIP...')
  }

  return (
    <SpaceBetween size="l">
      <Header variant="h1">Export Data</Header>

      {/* Export Recurring Rules */}
      <Container
        header={
          <Header variant="h2">
            Export Recurring Rules
          </Header>
        }
      >
        <SpaceBetween size="m">
          <FormField label="Profile">
            <Select
              selectedOption={selectedProfile}
              onChange={({ detail }) => setSelectedProfile(detail.selectedOption)}
              options={profileOptions}
            />
          </FormField>

          <FormField label="Include">
            <SpaceBetween size="xs">
              <Checkbox checked={includeActive} onChange={({ detail }) => setIncludeActive(detail.checked)}>
                Active rules
              </Checkbox>
              <Checkbox checked={includeInactive} onChange={({ detail }) => setIncludeInactive(detail.checked)}>
                Inactive/Excluded rules
              </Checkbox>
              <Checkbox checked={includeDraft} onChange={({ detail }) => setIncludeDraft(detail.checked)}>
                Draft/Scenario rules
              </Checkbox>
              <Checkbox checked={includeDescriptions} onChange={({ detail }) => setIncludeDescriptions(detail.checked)}>
                Descriptions/Notes
              </Checkbox>
            </SpaceBetween>
          </FormField>

          <FormField label="File name">
            <Input
              value={`${selectedProfile.label}_Recurring_Rules_2025-11-21.csv`}
              readOnly
            />
          </FormField>

          <Button variant="primary" iconName="download" onClick={handleExportRules}>
            Export Recurring Rules to CSV
          </Button>
        </SpaceBetween>
      </Container>

      {/* Export Cash Flow Data */}
      <Container
        header={
          <Header variant="h2">
            Export Cash Flow Data
          </Header>
        }
      >
        <SpaceBetween size="m">
          <FormField label="Date Range">
            <SpaceBetween size="xs" direction="horizontal">
              <FormField label="From">
                <DatePicker
                  value={fromDate}
                  onChange={({ detail }) => setFromDate(detail.value)}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>
              <FormField label="To">
                <DatePicker
                  value={toDate}
                  onChange={({ detail }) => setToDate(detail.value)}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>
            </SpaceBetween>
          </FormField>

          <FormField label="Include">
            <SpaceBetween size="xs">
              <Checkbox checked={includeDailyTotals} onChange={({ detail }) => setIncludeDailyTotals(detail.checked)}>
                Daily totals
              </Checkbox>
              <Checkbox checked={includeRunningBalance} onChange={({ detail }) => setIncludeRunningBalance(detail.checked)}>
                Running balance
              </Checkbox>
              <Checkbox checked={includeOverrides} onChange={({ detail }) => setIncludeOverrides(detail.checked)}>
                Balance overrides
              </Checkbox>
              <Checkbox checked={includeScenarioData} onChange={({ detail }) => setIncludeScenarioData(detail.checked)}>
                Include draft/scenario data
              </Checkbox>
            </SpaceBetween>
          </FormField>

          <FormField label="File name">
            <Input
              value={`${selectedProfile.label}_CashFlow_05-24_12-31-2025.csv`}
              readOnly
            />
          </FormField>

          <Button variant="primary" iconName="download" onClick={handleExportCashFlow}>
            Export Cash Flow to CSV
          </Button>
        </SpaceBetween>
      </Container>

      {/* Export All Profiles */}
      <Container
        header={
          <Header variant="h2">
            Export All Profiles
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Box variant="p">
            Export all profiles including recurring rules and cash flow data as a ZIP archive.
          </Box>
          <Box variant="p" color="text-body-secondary">
            Profiles to export: Personal, Business, Rental Property (3 profiles)
          </Box>
          <Button variant="primary" iconName="download" onClick={handleExportAll}>
            Export All Profiles (ZIP)
          </Button>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  )
}
