export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
  }
}

export async function extractMetadata(url: string): Promise<{ title?: string; description?: string }> {
  try {
    // For security reasons, we can't directly fetch from other domains in the browser
    // This would typically be done by a backend service
    // For now, we'll return basic metadata based on the URL
    const domain = new URL(url).hostname;
    return {
      title: domain.replace('www.', ''),
      description: `Website: ${domain}`
    };
  } catch {
    return {};
  }
}