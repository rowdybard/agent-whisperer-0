/**
 * Validates AI output against a level's win condition.
 * Returns { passed: boolean, message: string }
 */
export function validateOutput(aiOutput, winCondition) {
  if (!winCondition || !aiOutput) {
    return { passed: false, message: 'No output to validate.' }
  }

  const text = aiOutput.trim()

  switch (winCondition.type) {
    case 'exact': {
      const passed = text === winCondition.value.trim()
      return {
        passed,
        message: passed
          ? 'Exact match achieved!'
          : `Expected exactly: "${winCondition.value}"`,
      }
    }

    case 'contains': {
      const passed = text.toLowerCase().includes(winCondition.value.toLowerCase())
      return {
        passed,
        message: passed
          ? 'Required content found!'
          : `Output must contain: "${winCondition.value}"`,
      }
    }

    case 'notContains': {
      const passed = !text.includes(winCondition.value)
      return {
        passed,
        message: passed
          ? 'Injection successfully blocked!'
          : `Output must NOT contain: "${winCondition.value}"`,
      }
    }

    case 'regex': {
      const flags = winCondition.flags ?? 'i'
      const regex = new RegExp(winCondition.value, flags)
      const matches = text.match(regex) || []
      const minMatches = winCondition.minMatches ?? 1
      const passed = matches.length >= minMatches
      return {
        passed,
        message: passed
          ? `Pattern matched ${matches.length} time(s)!`
          : `Pattern "${winCondition.value}" must match at least ${minMatches} time(s). Found ${matches.length}.`,
      }
    }

    case 'json': {
      try {
        const jsonText = extractJSON(text)
        const parsed = JSON.parse(jsonText)
        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
          return { passed: false, message: 'Output must be a JSON object, not an array or null.' }
        }
        const requiredKeys = winCondition.requiredKeys ?? []
        const missingKeys = requiredKeys.filter((k) => !(k in parsed))
        if (missingKeys.length > 0) {
          return {
            passed: false,
            message: `JSON is missing required keys: ${missingKeys.join(', ')}`,
          }
        }
        return { passed: true, message: 'Valid JSON with all required keys!' }
      } catch {
        return { passed: false, message: 'Output is not valid JSON. Strip markdown code fences.' }
      }
    }

    default:
      return { passed: false, message: `Unknown win condition type: "${winCondition.type}"` }
  }
}

/**
 * Strips markdown code fences from a string to extract raw JSON.
 */
function extractJSON(text) {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1)
  }
  return text.trim()
}
