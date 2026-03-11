const axios = require('axios');

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.PUBMED_API_KEY || '';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyByPmid(pmid) {
  try {
    const params = {
      db: 'pubmed',
      id: pmid,
      retmode: 'json',
      ...(API_KEY && { api_key: API_KEY })
    };

    const response = await axios.get(`${PUBMED_BASE}/esummary.fcgi`, { params, timeout: 8000 });
    const result = response.data?.result;

    if (!result || result.uids?.length === 0) return null;

    const article = result[pmid];
    if (!article || article.error) return null;

    return {
      pmid,
      title: article.title,
      journal: article.source,
      year: article.pubdate?.split(' ')[0],
      authors: article.authors?.slice(0, 3).map(a => a.name).join(', ') + (article.authors?.length > 3 ? ' et al.' : ''),
      doi: article.elocationid || null,
      verified: true,
      pubmed_url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
    };
  } catch {
    return null;
  }
}

async function searchByKeywords(citation) {
  try {
    const query = buildSearchQuery(citation);
    if (!query) return null;

    const searchParams = {
      db: 'pubmed',
      term: query,
      retmax: 3,
      retmode: 'json',
      sort: 'relevance',
      ...(API_KEY && { api_key: API_KEY })
    };

    const searchRes = await axios.get(`${PUBMED_BASE}/esearch.fcgi`, { params: searchParams, timeout: 8000 });
    const ids = searchRes.data?.esearchresult?.idlist;

    if (!ids || ids.length === 0) return null;

    const verified = await verifyByPmid(ids[0]);
    if (!verified) return null;

    if (citation.year && Math.abs(parseInt(verified.year) - parseInt(citation.year)) > 2) {
      return null;
    }

    return { ...verified, pmid: ids[0] };
  } catch {
    return null;
  }
}

function buildSearchQuery(citation) {
  const parts = [];

  if (citation.authors) {
    const firstAuthor = citation.authors.split(' ')[0].replace(',', '');
    if (firstAuthor.length > 2) parts.push(`${firstAuthor}[Author]`);
  }

  if (citation.year) parts.push(`${citation.year}[PDAT]`);

  if (citation.journal) parts.push(`"${citation.journal}"[Journal]`);

  if (citation.title && citation.title.length > 10) {
    const keyTerms = citation.title
      .split(' ')
      .filter(w => w.length > 5)
      .slice(0, 4)
      .join(' AND ');
    if (keyTerms) parts.push(keyTerms);
  }

  return parts.slice(0, 4).join(' AND ') || null;
}

async function verifyCitations(citations) {
  const results = [];

  for (const citation of citations) {
    await delay(API_KEY ? 120 : 350);

    let verified = null;

    if (citation.pmid && citation.pmid !== 'null') {
      verified = await verifyByPmid(citation.pmid);
    }

    if (!verified) {
      verified = await searchByKeywords(citation);
    }

    if (verified) {
      results.push({
        ...citation,
        ...verified,
        verified: true,
        verification_status: 'confirmed'
      });
    } else {
      results.push({
        ...citation,
        verified: false,
        verification_status: citation.pmid ? 'pmid_not_found' : 'unverified',
        pubmed_url: citation.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/` : null
      });
    }
  }

  return results;
}

async function verifyAllCitations(pairs) {
  const verifiedPairs = [];

  for (const pair of pairs) {
    const needCitations = await verifyCitations(pair.need?.citations || []);
    const solutionCitations = await verifyCitations(pair.solution?.citations || []);

    verifiedPairs.push({
      ...pair,
      need: { ...pair.need, citations: needCitations },
      solution: { ...pair.solution, citations: solutionCitations }
    });
  }

  return verifiedPairs;
}

module.exports = { verifyCitations, verifyAllCitations, verifyByPmid };
