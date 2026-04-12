export async function searchPubMed(query: string) {
  const response = await fetch(`/api/pubmed/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch from PubMed');
  }
  return response.json();
}
