export function formatAppId(id: string): string {
  // If already in new format, return as-is
  if (id?.startsWith('EC/')) return id;
  
  // Legacy IDs — extract last 4 digits for display
  const num = id?.replace(/\D/g, '').slice(-4) || '0000';
  const year = new Date().getFullYear();
  const fy = `${year}-${String(year+1).slice(2)}`;
  return `EC/${fy}/CAT-A/${num}`;
}
