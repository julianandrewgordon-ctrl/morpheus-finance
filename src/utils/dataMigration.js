// Data Migration Utilities

/**
 * Migrate scenarioId (single) to scenarioIds (array)
 * This is a one-time migration for existing data
 */
export function migrateScenarioIdToArray(data) {
  if (!data.recurringRules) return data
  
  const migratedRules = data.recurringRules.map(rule => {
    // If already has scenarioIds array, skip
    if (rule.scenarioIds !== undefined) return rule
    
    // Migrate scenarioId to scenarioIds
    const { scenarioId, ...rest } = rule
    
    return {
      ...rest,
      scenarioIds: scenarioId ? [scenarioId] : []
    }
  })
  
  return {
    ...data,
    recurringRules: migratedRules
  }
}

/**
 * Check if data needs migration
 */
export function needsMigration(data) {
  if (!data.recurringRules || data.recurringRules.length === 0) return false
  
  // Check if any rule still uses old scenarioId format
  return data.recurringRules.some(rule => 
    rule.scenarioId !== undefined && rule.scenarioIds === undefined
  )
}

/**
 * Migrate data on load
 */
export function migrateDataIfNeeded(data) {
  if (needsMigration(data)) {
    console.log('Migrating data from scenarioId to scenarioIds...')
    return migrateScenarioIdToArray(data)
  }
  return data
}
