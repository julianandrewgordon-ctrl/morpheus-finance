import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const BASE_COLOR = '#3498db'  // Blue for Base Scenario

const SCENARIO_COLORS = [
  '#e74c3c',   // Red
  '#2ecc71',   // Green
  '#f39c12',   // Orange
  '#9b59b6',   // Purple
  '#1abc9c',   // Turquoise
  '#e67e22',   // Dark Orange
  '#16a085',   // Dark Turquoise
  '#c0392b',   // Dark Red
  '#27ae60',   // Dark Green
  '#d35400',   // Burnt Orange
  '#8e44ad',   // Deep Purple
  '#c0392b'    // Crimson
]

const getScenarioColor = (index) => {
  return SCENARIO_COLORS[index % SCENARIO_COLORS.length]
}

export default function BalanceChart({ cashFlowData, startingBalanceDate, scenarioCashFlows, scenarios }) {
  // Prepare chart data from cash flow data
  const chartData = useMemo(() => {
    const startDate = new Date(startingBalanceDate)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 12) // Show 12 months of data
    
    if (!scenarioCashFlows || Object.keys(scenarioCashFlows).length === 0) {
      // Fallback to single line if no scenario data
      if (!cashFlowData || cashFlowData.length === 0) return []
      
      const filteredData = cashFlowData.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate && itemDate <= endDate
      })
      
      // Sample every 14 days to show more range
      const sampledData = filteredData.filter((_, index) => index % 14 === 0 || index === filteredData.length - 1)
      
      return sampledData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        balance: Math.round(item.runningBalance),
        fullDate: item.date
      }))
    }
    
    // Multi-scenario chart data
    // Generate date points at regular intervals across the full 12 months
    const dataPoints = []
    const currentDate = new Date(startDate)
    
    // Create a data point every 15 days for 12 months (approximately 24 points)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dataPoints.push(dateStr)
      currentDate.setDate(currentDate.getDate() + 15)
    }
    
    // Ensure we include the end date
    if (dataPoints[dataPoints.length - 1] !== endDate.toISOString().split('T')[0]) {
      dataPoints.push(endDate.toISOString().split('T')[0])
    }
    
    // Build chart data with all scenarios
    return dataPoints.map(date => {
      const dateObj = new Date(date)
      const dataPoint = {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        fullDate: date
      }
      
      // Add balance for each scenario by finding the closest date with data
      Object.entries(scenarioCashFlows).forEach(([scenarioId, flowData]) => {
        // Find the data point on or before this date
        let balance = null
        for (let i = flowData.length - 1; i >= 0; i--) {
          if (flowData[i].date <= date) {
            balance = flowData[i].runningBalance
            break
          }
        }
        
        if (balance !== null) {
          dataPoint[`scenario_${scenarioId}`] = Math.round(balance)
        }
      })
      
      return dataPoint
    })
  }, [cashFlowData, startingBalanceDate, scenarioCashFlows, scenarios])

  if (chartData.length === 0) {
    return (
      <div style={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#666'
      }}>
        No data available for chart
      </div>
    )
  }

  // Determine which lines to show
  const hasScenarios = scenarioCashFlows && Object.keys(scenarioCashFlows).length > 0
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          formatter={(value) => `$${value.toLocaleString()}`}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        
        {hasScenarios ? (
          // Multi-scenario lines
          <>
            {/* Base Scenario */}
            <Line 
              type="monotone" 
              dataKey="scenario_committed" 
              stroke={BASE_COLOR}
              strokeWidth={3}
              name="Base Scenario"
              dot={false}
            />
            
            {/* Other Scenarios */}
            {scenarios && scenarios.filter(s => !s.isBaseline).map((scenario, index) => (
              <Line 
                key={scenario.id}
                type="monotone" 
                dataKey={`scenario_${scenario.id}`}
                stroke={getScenarioColor(index)}
                strokeWidth={3}
                name={scenario.name}
                dot={false}
              />
            ))}
          </>
        ) : (
          // Single line fallback
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#3498db" 
            strokeWidth={2}
            name="Running Balance"
            dot={{ r: 3 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
