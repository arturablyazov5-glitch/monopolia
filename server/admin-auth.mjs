import { randomBytes, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(derive);
export const secret = () => randomBytes(32).toString('hex');
export const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a),Buffer.from(b));
export async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password,salt,64);
  return `scrypt$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const match = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(encoded || '');
  // Same expensive work even for an unconfigured account.
  const key = await scrypt(password, match?.[1] || '00000000000000000000000000000000',64);
  return Boolean(match && equal(key.toString('hex'),match[2]));
}
