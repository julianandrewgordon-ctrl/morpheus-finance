import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const SCENARIO_COLORS = {
  committed: '#3498db',
  2: '#e74c3c',
  3: '#2ecc71',
  4: '#f39c12',
  5: '#9b59b6',
  6: '#1abc9c',
  7: '#e67e22',
  8: '#34495e'
}

export default function BalanceChart({ cashFlowData, startingBalanceDate, scenarioCashFlows, scenarios }) {
  // Prepare chart data from cash flow data
  const chartData = useMemo(() => {
    if (!scenarioCashFlows || Object.keys(scenarioCashFlows).length === 0) {
      // Fallback to single line if no scenario data
      if (!cashFlowData || cashFlowData.length === 0) return []
      
      const startDate = new Date(startingBalanceDate)
      const filteredData = cashFlowData.filter(item => new Date(item.date) >= startDate)
      const sampledData = filteredData.filter((_, index) => index % 7 === 0 || index === filteredData.length - 1)
      
      return sampledData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(item.runningBalance),
        fullDate: item.date
      }))
    }
    
    // Multi-scenario chart data
    const startDate = new Date(startingBalanceDate)
    const allDates = new Set()
    
    // Collect all dates from all scenarios
    Object.values(scenarioCashFlows).forEach(flowData => {
      flowData.forEach(item => {
        if (new Date(item.date) >= startDate) {
          allDates.add(item.date)
        }
      })
    })
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort()
    
    // Sample dates (every 7th day)
    const sampledDates = sortedDates.filter((_, index) => index % 7 === 0 || index === sortedDates.length - 1)
    
    // Build chart data with all scenarios
    return sampledDates.map(date => {
      const dataPoint = {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date
      }
      
      // Add balance for each scenario
      Object.entries(scenarioCashFlows).forEach(([scenarioId, flowData]) => {
        const dayData = flowData.find(item => item.date === date)
        if (dayData) {
          dataPoint[`scenario_${scenarioId}`] = Math.round(dayData.runningBalance)
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
              stroke={SCENARIO_COLORS.committed}
              strokeWidth={2}
              name="Base Scenario"
              dot={false}
            />
            
            {/* Other Scenarios */}
            {scenarios && scenarios.filter(s => !s.isBaseline).map(scenario => (
              <Line 
                key={scenario.id}
                type="monotone" 
                dataKey={`scenario_${scenario.id}`}
                stroke={SCENARIO_COLORS[scenario.id] || '#95a5a6'}
                strokeWidth={2}
                strokeDasharray="5 5"
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
