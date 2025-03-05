export function verifyRequestOrigin(origin: string, allowedDomains: string[]): boolean {
  if (!origin || allowedDomains.length === 0) {
    return false;
  }
  const originHost = safeURL(origin)?.host;
  if (!originHost) {
    return false;
  }
  for (const domain of allowedDomains) {
    let host: string | undefined;
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      host = safeURL(domain)?.host;
    } else {
      host = safeURL("https://" + domain)?.host;
    }
    if (originHost === host) {
      return true;
    }
  }
  return false;
}

function safeURL(url: URL | string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}
