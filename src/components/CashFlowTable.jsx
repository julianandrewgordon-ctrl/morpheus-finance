import { Table, Text, Switch, Group, Box, Tooltip, Stack } from '@mantine/core'

export default function CashFlowTable({ data, startDate, hideEmptyRows, onHideEmptyRowsChange }) {
  let filteredData = startDate 
    ? data.filter(item => item.date >= startDate)
    : data
  
  if (hideEmptyRows) {
    filteredData = filteredData.filter(item => {
      return item.transactions && item.transactions.length > 0
    })
  }

  const formatCurrency = (value) => {
    if (value === 0) return '-'
    const formatted = `$${Math.abs(value).toLocaleString()}`
    return value < 0 ? `-${formatted}` : formatted
  }

  const getCellColor = (value) => {
    if (value === 0) return 'dimmed'
    return value > 0 ? 'green' : 'red'
  }

  const renderCellWithTooltip = (item, field, forceRed = false) => {
    const value = item[field]
    if (value === 0) return <Text c="dimmed">-</Text>
    
    let transactions = (item.transactions || []).filter(t => t.column === field)
    
    const color = forceRed ? 'red' : getCellColor(value)
    
    if (transactions.length === 0) {
      return <Text c={color}>{formatCurrency(value)}</Text>
    }
    
    return (
      <Tooltip
        label={
          <Stack gap={4}>
            <Text fw={700} size="sm">BREAKDOWN:</Text>
            {transactions.map((t, idx) => (
              <Box key={idx}>
                <Text size="sm">{t.name}: ${Math.abs(t.amount).toLocaleString()}{t.isDraft && ' ⚠'}</Text>
                {t.phaseInfo && (
                  <Text size="xs" c="dimmed">
                    Phase {t.phaseInfo.phaseNumber}/{t.phaseInfo.totalPhases}
                    {t.phaseInfo.description && `: ${t.phaseInfo.description}`}
                  </Text>
                )}
              </Box>
            ))}
            <Text fw={700} size="sm" mt={4} style={{ borderTop: '1px solid #ddd', paddingTop: 4 }}>
              TOTAL: {formatCurrency(value)}
            </Text>
          </Stack>
        }
        multiline
        w={250}
      >
        <Text c={color} style={{ cursor: 'pointer' }}>{formatCurrency(value)}</Text>
      </Tooltip>
    )
  }

  if (filteredData.length === 0) {
    return (
      <Box ta="center" py="xl">
        <Text fw={700}>No cash flow data</Text>
        <Text c="dimmed">No cash flow entries to display.</Text>
      </Box>
    )
  }

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Switch
          checked={hideEmptyRows}
          onChange={(e) => onHideEmptyRowsChange(e.currentTarget.checked)}
          label="Hide empty rows"
        />
      </Group>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Income</Table.Th>
            <Table.Th>BOA</Table.Th>
            <Table.Th>PNC</Table.Th>
            <Table.Th>Variable Expenses</Table.Th>
            <Table.Th>Reno Costs</Table.Th>
            <Table.Th>One-off Expenses</Table.Th>
            <Table.Th>Net CF</Table.Th>
            <Table.Th>Running Balance</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredData.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td>{item.date}</Table.Td>
              <Table.Td>{renderCellWithTooltip(item, 'income')}</Table.Td>
              <Table.Td>{renderCellWithTooltip(item, 'boa', true)}</Table.Td>
              <Table.Td>{renderCellWithTooltip(item, 'pnc', true)}</Table.Td>
              <Table.Td>{renderCellWithTooltip(item, 'variable', true)}</Table.Td>
              <Table.Td>{renderCellWithTooltip(item, 'reno', true)}</Table.Td>
              <Table.Td>{renderCellWithTooltip(item, 'oneOff', true)}</Table.Td>
              <Table.Td><Text c={getCellColor(item.netCashFlow)}>{formatCurrency(item.netCashFlow)}</Text></Table.Td>
              <Table.Td><Text fw={700}>{formatCurrency(item.runningBalance)}</Text></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}
