import { cities } from '../data/cities';

// The current catalog contract stores the city at the start of the address.
// Unknown addresses stay out of the selection rather than appearing in both cities.
export function matchesCatalogCity(address: string, city: string) {
  if (!cities.includes(city)) return false;
  const normalized = address.trim().replace(/^г(?:\.|\s)\s*/iu, '').toLocaleLowerCase('ru-RU');
  const prefix = city.toLocaleLowerCase('ru-RU');
  return normalized.startsWith(prefix) && /^(?:$|[\s,.;])/.test(normalized.slice(prefix.length));
}
