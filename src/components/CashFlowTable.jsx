import { useState } from 'react'
import Table from '@cloudscape-design/components/table'
import Box from '@cloudscape-design/components/box'
import Popover from '@cloudscape-design/components/popover'
import StatusIndicator from '@cloudscape-design/components/status-indicator'
import Toggle from '@cloudscape-design/components/toggle'
import SpaceBetween from '@cloudscape-design/components/space-between'

export default function CashFlowTable({ data, startDate, hideEmptyRows, onHideEmptyRowsChange }) {
  // Filter data based on start date
  let filteredData = startDate 
    ? data.filter(item => item.date >= startDate)
    : data
  
  // Filter out empty rows if hideEmptyRows is enabled
  if (hideEmptyRows) {
    filteredData = filteredData.filter(item => {
      // A row is considered "empty" if it has no transactions
      return item.transactions && item.transactions.length > 0
    })
  }

  const formatCurrency = (value) => {
    if (value === 0) return '-'
    const formatted = `$${Math.abs(value).toLocaleString()}`
    return value < 0 ? `-${formatted}` : formatted
  }

  const getCellColor = (value) => {
    if (value === 0) return 'text-body-secondary'
    return value > 0 ? 'text-status-success' : 'text-status-error'
  }

  const renderCellWithTooltip = (item, field, categoryFilter = null, forceRed = false) => {
    const value = item[field]
    if (value === 0) return <Box color="text-body-secondary">-</Box>
    
    // Get transactions for this field - filter by column metadata
    let transactions = (item.transactions || []).filter(t => t.column === field)
    
    // Apply additional category filter if provided
    if (categoryFilter) {
      transactions = transactions.filter(categoryFilter)
    }
    
    // Determine color: force red for expense columns, otherwise use getCellColor
    const color = forceRed ? 'text-status-error' : getCellColor(value)
    
    if (transactions.length === 0) {
      return (
        <Box color={color} variant="span">
          {formatCurrency(value)}
        </Box>
      )
    }
    
    return (
      <Popover
        dismissButton={false}
        position="top"
        size="small"
        triggerType="custom"
        content={
          <Box>
            <Box variant="strong">BREAKDOWN:</Box>
            {transactions.map((t, idx) => (
              <Box key={idx} margin={{ top: 'xs' }}>
                {t.name}: ${Math.abs(t.amount).toLocaleString()}
                {t.isDraft && ' ⚠'}
                {t.phaseInfo && (
                  <Box fontSize="body-s" color="text-body-secondary">
                    Phase {t.phaseInfo.phaseNumber}/{t.phaseInfo.totalPhases}
                    {t.phaseInfo.description && `: ${t.phaseInfo.description}`}
                  </Box>
                )}
              </Box>
            ))}
            <Box margin={{ top: 'xs' }} paddingTop="xs" style={{ borderTop: '1px solid #ddd' }}>
              <Box variant="strong">TOTAL: {formatCurrency(value)}</Box>
            </Box>
          </Box>
        }
      >
        <Box color={color} variant="span" style={{ cursor: 'pointer' }}>
          {formatCurrency(value)}
        </Box>
      </Popover>
    )
  }

  const columnDefinitions = [
    {
      id: 'date',
      header: 'Date',
      cell: item => <Box variant="span">{item.date}</Box>,
      width: 120,
      minWidth: 120
    },
    {
      id: 'income',
      header: 'Income',
      cell: item => renderCellWithTooltip(item, 'income'),
      width: 100
    },
    {
      id: 'boa',
      header: 'BOA',
      cell: item => renderCellWithTooltip(item, 'boa', null, true),
      width: 100
    },
    {
      id: 'pnc',
      header: 'PNC',
      cell: item => renderCellWithTooltip(item, 'pnc', null, true),
      width: 100
    },
    {
      id: 'variable',
      header: 'Variable Expenses',
      cell: item => renderCellWithTooltip(item, 'variable', null, true),
      width: 130
    },
    {
      id: 'reno',
      header: 'Reno Costs',
      cell: item => renderCellWithTooltip(item, 'reno', null, true),
      width: 100
    },
    {
      id: 'oneOff',
      header: 'One-off Expenses',
      cell: item => renderCellWithTooltip(item, 'oneOff', null, true),
      width: 130
    },
    {
      id: 'netCashFlow',
      header: 'Net CF',
      cell: item => <Box color={getCellColor(item.netCashFlow)}>{formatCurrency(item.netCashFlow)}</Box>,
      width: 100
    },
    {
      id: 'runningBalance',
      header: 'Running Balance',
      cell: item => <Box variant="strong">{formatCurrency(item.runningBalance)}</Box>,
      width: 130
    }
  ]

  return (
    <SpaceBetween size="m">
      <Box float="right">
        <Toggle
          checked={hideEmptyRows}
          onChange={({ detail }) => onHideEmptyRowsChange(detail.checked)}
        >
          Hide empty rows
        </Toggle>
      </Box>
      <Table
        columnDefinitions={columnDefinitions}
        items={filteredData}
        variant="embedded"
        stickyHeader
        stripedRows
        wrapLines={false}
        empty={
          <Box textAlign="center" color="inherit">
            <b>No cash flow data</b>
            <Box variant="p" color="inherit">
              No cash flow entries to display.
            </Box>
          </Box>
        }
      />
    </SpaceBetween>
  )
}
