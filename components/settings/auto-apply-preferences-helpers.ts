/**
 * Helper functions to convert between backend format (string arrays) 
 * and frontend UI format (objects with IDs for easy manipulation)
 */

// UI-only types for internal state management
export interface JobTitlePreference {
  id: string
  title: string
  priority: number
}

export interface LocationPreference {
  id: string
  location: string
  type: 'country' | 'city' | 'remote_only'
}

/**
 * Convert backend string array to UI-friendly object array
 */
export function stringsToJobTitles(titles: string[]): JobTitlePreference[] {
  return titles.map((title, index) => ({
    id: `title-${index}-${Date.now()}`,
    title,
    priority: index,
  }))
}

/**
 * Convert UI object array back to backend string array
 */
export function jobTitlesToStrings(titles: JobTitlePreference[]): string[] {
  return titles.map((t) => t.title)
}

/**
 * Convert backend string array to UI-friendly object array
 */
export function stringsToLocations(locations: string[]): LocationPreference[] {
  return locations.map((location, index) => ({
    id: `location-${index}-${Date.now()}`,
    location,
    type: location.toLowerCase().includes('remote') ? 'remote_only' : 'city',
  }))
}

/**
 * Convert UI object array back to backend string array
 */
export function locationsToStrings(locations: LocationPreference[]): string[] {
  return locations.map((l) => l.location)
}

// UI-only type for skills
export interface SkillPreference {
  id: string
  skill: string
  weight: 'required' | 'nice_to_have'
}

/**
 * Convert backend string array to UI-friendly object array
 * Filters out empty strings
 */
export function stringsToSkills(skills: string[] | undefined | null): SkillPreference[] {
  if (!skills || !Array.isArray(skills)) {
    return []
  }
  return skills
    .filter((skill) => skill && typeof skill === 'string' && skill.trim().length > 0)
    .map((skill, index) => ({
      id: `skill-${index}-${Date.now()}`,
      skill: skill.trim(),
      weight: 'nice_to_have' as const,
    }))
}

/**
 * Convert UI object array back to backend string array
 */
export function skillsToStrings(skills: SkillPreference[] | undefined | null): string[] {
  if (!skills || !Array.isArray(skills)) {
    return []
  }
  return skills
    .filter((s) => s && s.skill && s.skill.trim().length > 0)
    .map((s) => s.skill.trim())
}

