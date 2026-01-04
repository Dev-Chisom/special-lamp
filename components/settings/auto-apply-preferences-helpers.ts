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

