// Centralized data management for localStorage to share state between Consumer and Lawyer apps
// Use extracted real settlement data as the source of truth.

const formatCurrencyRange = (min, max) => {
  if (min === null || min === undefined) min = null;
  if (max === null || max === undefined) max = null;
  
  const hasMin = typeof min === 'number' && !Number.isNaN(min);
  const hasMax = typeof max === 'number' && !Number.isNaN(max);

  if (hasMin && hasMax) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }

  if (hasMax) {
    return `Up to $${max.toLocaleString()}`;
  }

  if (hasMin) {
    return `$${min.toLocaleString()}`;
  }

  return 'Varies';
};

const formatTotalAmount = (rawTotal) => {
  if (!rawTotal || rawTotal === 'Not specified') return 'Not specified';

  const numeric = Number(String(rawTotal).replace(/[^0-9.]/g, ''));
  if (Number.isNaN(numeric) || numeric === 0) {
    return `$${String(rawTotal)}`;
  }

  if (numeric >= 1_000_000_000) {
    return `$${(numeric / 1_000_000_000).toFixed(2)}B`;
  }

  if (numeric >= 1_000_000) {
    return `$${(numeric / 1_000_000).toFixed(2)}M`;
  }

  if (numeric >= 1_000) {
    return `$${(numeric / 1_000).toFixed(2)}K`;
  }

  return `$${numeric.toLocaleString()}`;
};

const parseDeadline = (dateStr) => {
  if (!dateStr) return '';
  // Try to parse common date formats and convert to YYYY-MM-DD
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // If parsing fails, return as-is
  }
  return dateStr;
};

const mapRawSettlement = (raw, index) => {
  const minPayout = raw.minimum_payout_amount != null ? Number(raw.minimum_payout_amount) : null;
  const maxPayout = raw.maximum_payout_amount != null ? Number(raw.maximum_payout_amount) : null;

  return {
    id: index + 1,
    name: raw.title || raw.full_settlement_title || 'Settlement',
    company: raw.company_defendant_name || 'Developer will provide',
    category: raw.category || 'Consumer Products',
    // High level financials
    amount: formatTotalAmount(raw.settlement_amount_total),
    deadline: parseDeadline(raw.claim_deadline_date),
    estimatedPayout: formatCurrencyRange(minPayout, maxPayout),
    // Proof & claim url
    proofOfPurchase: Boolean(raw.proof_of_purchase_required),
    claimUrl: raw.direct_claim_filing_url || '',
    // Extra detail fields for the Settlement Details page (no *_url except company_logo_url + direct_claim_filing_url)
    logoUrl: raw.company_logo_url || '',
    summary: raw.settlement_summary || '',
    caseNumber: raw.case_number || 'Not specified',
    court: raw.court || 'Not specified',
    payoutDescription: raw.payout_calculation_description || '',
    claimDeadlineText: raw.claim_deadline_date || '',
  };
};

let DEFAULT_SETTLEMENTS = [];

// Load JSON data asynchronously - try multiple paths
const loadSettlementData = async () => {
  const paths = [
    '/settlements-data.json',
    '/extract-data-2026-01-20 (1).json',
    './extract-data-2026-01-20 (1).json'
  ];
  
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.settlements)) {
          return data.settlements.map(mapRawSettlement);
        }
      }
    } catch (error) {
      // Try next path
      continue;
    }
  }
  
  console.warn('Could not load settlement data from JSON, using empty array');
  return [];
};

export const initializeStorage = async () => {
  // Always load fresh data from JSON file and replace localStorage
  const freshData = await loadSettlementData();
  if (freshData.length > 0) {
    localStorage.setItem('settlements', JSON.stringify(freshData));
  } else {
    localStorage.setItem('settlements', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('claims')) {
    localStorage.setItem('claims', JSON.stringify([]));
  }
};

export const getSettlements = async () => {
  try {
    // Always try to load fresh data first
    const freshData = await loadSettlementData();
    if (freshData.length > 0) {
      localStorage.setItem('settlements', JSON.stringify(freshData));
      localStorage.setItem('settlements_version', '2.0'); // Version marker
      return freshData;
    }
    
    // Fallback to localStorage if fetch fails
    const data = localStorage.getItem('settlements');
    const stored = data ? JSON.parse(data) : [];
    
    // If we have old dummy data (6 items or less), clear it
    if (stored.length <= 6 && localStorage.getItem('settlements_version') !== '2.0') {
      localStorage.removeItem('settlements');
      return [];
    }
    
    return stored;
  } catch (e) {
    console.error('Error getting settlements:', e);
    return [];
  }
};

export const saveSettlement = async (settlement) => {
  const settlements = await getSettlements();
  const newSettlement = { ...settlement, id: Date.now() };
  settlements.unshift(newSettlement);
  localStorage.setItem('settlements', JSON.stringify(settlements));
  return newSettlement;
};

export const getClaims = () => {
  try {
    return JSON.parse(localStorage.getItem('claims') || '[]');
  } catch (e) {
    return [];
  }
};

export const updateClaimStatus = (claimId, newStatus) => {
  const claims = getClaims();
  const updatedClaims = claims.map(claim => 
    claim.id === claimId ? { ...claim, status: newStatus } : claim
  );
  localStorage.setItem('claims', JSON.stringify(updatedClaims));
  return updatedClaims;
};