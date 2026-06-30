export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
}

export function parseMarkdownToHTML(text: string): string {
  // Simple markdown-to-safe-string parsing for tooltips
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)\n/g, '<h4 class="font-bold my-2 text-slate-100">$1</h4>')
    .replace(/- (.*?)\n/g, '<li class="ml-4 list-disc">$1</li>');
}
