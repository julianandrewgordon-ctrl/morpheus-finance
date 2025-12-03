// Rule Override Utilities

/**
 * Apply overrides to a rule for a specific scenario
 * @param {Object} rule - The base rule
 * @param {Array} overrides - Array of override objects
 * @param {Number} scenarioId - The scenario ID
 * @returns {Object} - Rule with overrides applied
 */
export function applyOverridesToRule(rule, overrides, scenarioId) {
  if (!overrides || !scenarioId) return rule
  
  // Find override for this rule in this scenario
  const override = overrides.find(
    o => o.baseRuleId === rule.id && o.scenarioId === scenarioId
  )
  
  if (!override) return rule
  
  // Apply overrides
  return {
    ...rule,
    ...override.overrides,
    _isOverridden: true,
    _overrideId: override.id,
    _originalValues: {
      amount: rule.amount,
      effectiveDate: rule.effectiveDate,
      endDate: rule.endDate,
      frequency: rule.frequency
    }
  }
}

/**
 * Get all rules for a scenario with overrides applied
 * @param {Array} baseRules - Rules without scenario assignment
 * @param {Array} scenarioRules - Rules specific to this scenario
 * @param {Array} overrides - All override objects
 * @param {Number} scenarioId - The scenario ID
 * @returns {Array} - Combined rules with overrides applied
 */
export function getRulesForScenario(baseRules, scenarioRules, overrides, scenarioId) {
  // Apply overrides to base rules
  const baseWithOverrides = baseRules.map(rule => 
    applyOverridesToRule(rule, overrides, scenarioId)
  )
  
  // Combine with scenario-specific rules
  return [...baseWithOverrides, ...scenarioRules]
}

/**
 * Create a new override
 * @param {Number} baseRuleId - ID of the rule to override
 * @param {Number} scenarioId - ID of the scenario
 * @param {Object} overrideValues - Values to override
 * @returns {Object} - New override object
 */
export function createOverride(baseRuleId, scenarioId, overrideValues) {
  return {
    id: Date.now() + Math.random(),
    baseRuleId,
    scenarioId,
    overrides: overrideValues,
    createdAt: new Date().toISOString()
  }
}

/**
 * Update an existing override
 * @param {Array} overrides - All overrides
 * @param {Number} overrideId - ID of override to update
 * @param {Object} newValues - New override values
 * @returns {Array} - Updated overrides array
 */
export function updateOverride(overrides, overrideId, newValues) {
  return overrides.map(override =>
    override.id === overrideId
      ? { ...override, overrides: newValues }
      : override
  )
}

/**
 * Remove an override
 * @param {Array} overrides - All overrides
 * @param {Number} overrideId - ID of override to remove
 * @returns {Array} - Updated overrides array
 */
export function removeOverride(overrides, overrideId) {
  return overrides.filter(override => override.id !== overrideId)
}

/**
 * Get override for a specific rule in a scenario
 * @param {Array} overrides - All overrides
 * @param {Number} baseRuleId - ID of the base rule
 * @param {Number} scenarioId - ID of the scenario
 * @returns {Object|null} - Override object or null
 */
export function getOverride(overrides, baseRuleId, scenarioId) {
  return overrides.find(
    o => o.baseRuleId === baseRuleId && o.scenarioId === scenarioId
  ) || null
}

/**
 * Check if a rule has an override in a scenario
 * @param {Array} overrides - All overrides
 * @param {Number} baseRuleId - ID of the base rule
 * @param {Number} scenarioId - ID of the scenario
 * @returns {Boolean}
 */
export function hasOverride(overrides, baseRuleId, scenarioId) {
  return getOverride(overrides, baseRuleId, scenarioId) !== null
}

/**
 * Get all overrides for a scenario
 * @param {Array} overrides - All overrides
 * @param {Number} scenarioId - ID of the scenario
 * @returns {Array} - Overrides for this scenario
 */
export function getOverridesForScenario(overrides, scenarioId) {
  return overrides.filter(o => o.scenarioId === scenarioId)
}
