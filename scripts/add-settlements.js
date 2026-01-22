import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read existing settlements
const existingPath = path.join(__dirname, '../public/settlements-data.json');
const existingData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

// New settlements data (first 20 key ones from user's list)
const newSettlements = [
  {
    title: "Belkin Power Bank Class Action Settlement",
    deadline: "March 30, 2026",
    withoutProof: "$2.00",
    withProof: "$5.00",
    settlementAmount: null,
    category: "Consumer Products"
  },
  {
    title: "$4.85M Bayer Antifungal Spray Open Class Action Settlement",
    deadline: "March 11, 2026",
    withoutProof: "Up to $21.00",
    withProof: "No Cap",
    settlementAmount: "4,850,000",
    category: "Consumer Products"
  },
  {
    title: "Michael Kors Outlet Misleading Discounts Class Action Settlement",
    deadline: "March 6, 2026",
    withoutProof: "Up to $30.00",
    withProof: "$30.00",
    settlementAmount: null,
    category: "Consumer Products"
  },
  {
    title: "$3M Energy Drink \"No Preservatives\" Class Action Settlement",
    deadline: "February 20, 2026",
    withoutProof: "Up to $10.00",
    withProof: "Up to $150.00",
    settlementAmount: "3,000,000",
    category: "Consumer Products"
  },
  {
    title: "$87.5M Consumer Beef Price Fixing Class Action Settlement",
    deadline: "June 30, 2026",
    withoutProof: "Varies",
    withProof: "Varies",
    settlementAmount: "87,500,000",
    category: "Consumer Products"
  },
  {
    title: "$9.95M Balance of Nature Supplements False Advertising Settlement",
    deadline: "March 11, 2026",
    withoutProof: "Up to $8.00",
    withProof: "Up to $30.00",
    settlementAmount: "9,950,000",
    category: "Consumer Products"
  },
  {
    title: "Sealy 1250 Thread Count False Advertising $750K Class Action Settlement",
    deadline: "May 12, 2026",
    withoutProof: "$5 - $40",
    withProof: "Varies",
    settlementAmount: "750,000",
    category: "Consumer Products"
  },
  {
    title: "$7.1M La-Z-Boy & Joybird.com Deceptive Advertising Class Action Settlement",
    deadline: "February 13, 2026",
    withoutProof: "N/A",
    withProof: "$115.00",
    settlementAmount: "7,100,000",
    category: "Consumer Products"
  },
  {
    title: "$33M \"Free Trial\" Wells Fargo Class Action Settlement",
    deadline: "March 4, 2026",
    withoutProof: "Varies",
    withProof: "Varies",
    settlementAmount: "33,000,000",
    category: "Financial Services"
  },
  {
    title: "$1.5 Billion Anthropic AI Copyright Infringement Settlement",
    deadline: "March 26, 2026",
    withoutProof: "N/A",
    withProof: "$3,000",
    settlementAmount: "1,500,000,000",
    category: "Technology"
  },
  {
    title: "$700M Google Play Store Consumer Antitrust Settlement",
    deadline: "February 19, 2026",
    withoutProof: "$2.00+",
    withProof: "$2.00+",
    settlementAmount: "700,000,000",
    category: "Technology"
  },
  {
    title: "$1.2 Billion Discover Merchant Card Fees Settlement",
    deadline: "May 18, 2026",
    withoutProof: "Varies",
    withProof: "Varies",
    settlementAmount: "1,200,000,000",
    category: "Financial Services"
  },
  {
    title: "$30M 23andMe Data Breach Class Action Settlement",
    deadline: "February 17, 2026",
    withoutProof: "N/A",
    withProof: "$165+",
    settlementAmount: "30,000,000",
    category: "Data Security"
  },
  {
    title: "$10M Nelnet Data Security Settlement Class Action",
    deadline: "March 5, 2026",
    withoutProof: "N/A",
    withProof: "$25.00+",
    settlementAmount: "10,000,000",
    category: "Data Security"
  },
  {
    title: "$30M Ford Focus & Ford Fiesta Transmission Class Action Settlement",
    deadline: "Varies",
    withoutProof: "N/A",
    withProof: "$2,325",
    settlementAmount: "30,000,000",
    category: "Automotive"
  },
  {
    title: "$78.5 Million Toyota Airbag Class Action Settlement",
    deadline: "December 16, 2026",
    withoutProof: "N/A",
    withProof: "Varies",
    settlementAmount: "78,500,000",
    category: "Automotive"
  },
  {
    title: "$60M United Southwest Delta American Airlines Settlement",
    deadline: "Pending",
    withoutProof: "N/A",
    withProof: "Varies",
    settlementAmount: "60,000,000",
    category: "Travel"
  },
  {
    title: "$582 Million Generic Drugs End-Payer and AG Consumer Settlements",
    deadline: "Pending",
    withoutProof: "Pending",
    withProof: "Pending",
    settlementAmount: "582,000,000",
    category: "Healthcare"
  }
];

function extractCompanyName(title) {
  const companies = ["Belkin", "Bayer", "Michael Kors", "Energy Drink", "Beef", "Balance of Nature", 
    "Sealy", "La-Z-Boy", "Joybird", "Wells Fargo", "Anthropic", "Google", "Discover", "23andMe", 
    "Nelnet", "Ford", "Toyota", "United", "Southwest", "Delta", "American Airlines"];
  
  for (const company of companies) {
    if (title.includes(company)) return company;
  }
  return "Developer will provide";
}

function parsePayout(amountStr) {
  if (!amountStr || amountStr === "N/A" || amountStr === "Varies" || amountStr === "Pending") return null;
  const numbers = amountStr.match(/[\d,]+\.?\d*/g);
  if (!numbers) return null;
  if (amountStr.includes("-") || amountStr.includes("to")) {
    return { min: parseFloat(numbers[0].replace(/,/g, '')), max: numbers[1] ? parseFloat(numbers[1].replace(/,/g, '')) : null };
  }
  if (amountStr.toLowerCase().includes("up to")) {
    return { min: null, max: parseFloat(numbers[0].replace(/,/g, '')) };
  }
  const amount = parseFloat(numbers[0].replace(/,/g, ''));
  return { min: amount, max: amount };
}

const generated = newSettlements.map((s, idx) => {
  const withoutProof = parsePayout(s.withoutProof);
  const withProof = parsePayout(s.withProof);
  const proofRequired = s.withoutProof === "N/A" && s.withProof !== "N/A";
  
  let payoutDesc = "Eligible class members may receive compensation based on the following:\n";
  if (s.withoutProof !== "N/A") payoutDesc += `• Without Proof of Purchase: ${s.withoutProof}\n`;
  if (s.withProof !== "N/A") payoutDesc += `• With Proof of Purchase: ${s.withProof}\n`;
  payoutDesc += "\nActual payout amounts may vary based on the number of valid claims submitted.";
  
  const summary = `You may be eligible to participate in this class action settlement${s.settlementAmount ? ` with a total settlement fund of $${s.settlementAmount.replace(/,/g, ',')}` : ''}. ${proofRequired ? 'Proof of purchase may be required for certain benefits.' : 'You may be eligible for compensation with or without proof of purchase.'}`;
  
  return {
    title: s.title,
    detail_url: `https://openclassactions.com/settlements/${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.php`,
    full_settlement_title: s.title,
    company_defendant_name: extractCompanyName(s.title),
    company_logo_url: "https://www.openclassactions.com/assets/images/default-logo.webp",
    claim_deadline_date: s.deadline,
    minimum_payout_amount: withoutProof?.min || withProof?.min || null,
    maximum_payout_amount: withoutProof?.max || withProof?.max || null,
    payout_calculation_description: payoutDesc,
    direct_claim_filing_url: `https://www.settlement-claim.com/claim?utm_source=openclassactions.com&settlement=${encodeURIComponent(s.title)}`,
    proof_of_purchase_required: proofRequired,
    max_proofs_allowed: null,
    settlement_amount_total: s.settlementAmount,
    category: s.category,
    case_number: `CASE-${String(existingData.settlements.length + idx + 1).padStart(6, '0')}`,
    court: "Court information will be provided",
    settlement_summary: summary,
    page_full_text: `${s.title}\n\n${summary}\n\n${payoutDesc}\n\nClaim Deadline: ${s.deadline}\n\nFor more information and to file a claim, please visit the official settlement website.`
  };
});

// Merge with existing
existingData.settlements = [...existingData.settlements, ...generated];

// Write back
fs.writeFileSync(existingPath, JSON.stringify(existingData, null, 2), 'utf8');
console.log(`Added ${generated.length} new settlements. Total: ${existingData.settlements.length}`);
