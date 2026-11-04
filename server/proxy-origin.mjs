// Forwarded headers are authoritative only behind an explicitly trusted local proxy.
export function trustedProxy(env, remoteAddress) {
  return env.TRUST_PROXY === '1' &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteAddress);
}

export function forwardedOrigin(headers, env, remoteAddress) {
  if (!trustedProxy(env, remoteAddress)) return null;
  const get = name => typeof headers.get === 'function' ? headers.get(name) : headers[name];
  const host = get('x-forwarded-host'), proto = get('x-forwarded-proto');
  // Reject lists, whitespace, user-info, paths and other ambiguous encodings.
  if (typeof host !== 'string' || !/^[a-z0-9.-]+(?::\d+)?$/.test(host) ||
      !['http', 'https'].includes(proto)) return null;
  return `${proto}://${host}`;
}

// Only npm run dev enables this rule. Production keeps exact origin allowlists.
export function localDevOrigin(headers, env, remoteAddress) {
  if (env.MONOPOLY_LOCAL_DEV !== '1' ||
      !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteAddress)) return null;
  const host = typeof headers.get === 'function' ? headers.get('host') : headers.host;
  const match = typeof host === 'string' && /^127\.0\.0\.1:([1-9]\d{0,4})$/.exec(host);
  if (!match || Number(match[1]) > 65535) return null;
  return `http://${host}`;
}
