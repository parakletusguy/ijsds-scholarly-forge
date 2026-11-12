// Serves /llms.txt and /llms-full.txt (https://llmstxt.org): a plain-text fact sheet
// that AI assistants read to learn what IJSDS is, built from src/lib/journalFacts.ts.
import { buildLlmsTxt } from '../src/lib/journalFacts.js';

export default function handler(req: any, res: any) {
  const full = String(req.query?.full ?? '') === '1';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(buildLlmsTxt(full));
}
