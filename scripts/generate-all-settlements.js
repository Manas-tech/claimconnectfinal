// Comprehensive script to generate all settlements from user data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All settlements data from user
const settlementsData = [
  { title: "Belkin Power Bank Class Action Settlement", deadline: "March 30, 2026", withoutProof: "$2.00", withProof: "$5.00", settlementAmount: null, category: "Consumer Products" },
  { title: "$4.85M Bayer Antifungal Spray Open Class Action Settlement", deadline: "March 11, 2026", withoutProof: "Up to $21.00", withProof: "No Cap", settlementAmount: "4,850,000", category: "Consumer Products" },
  { title: "Michael Kors Outlet Misleading Discounts Class Action Settlement", deadline: "March 6, 2026", withoutProof: "Up to $30.00", withProof: "$30.00", settlementAmount: null, category: "Consumer Products" },
  { title: "$3M Energy Drink \"No Preservatives\" Class Action Settlement", deadline: "February 20, 2026", withoutProof: "Up to $10.00", withProof: "Up to $150.00", settlementAmount: "3,000,000", category: "Consumer Products" },
  { title: "DraftKings and FanDuel Sports Gambling App Addiction Lawsuits", deadline: "Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Legal Services" },
  { title: "$87.5M Consumer Beef Price Fixing Class Action Settlement", deadline: "June 30, 2026", withoutProof: "Varies", withProof: "Varies", settlementAmount: "87,500,000", category: "Consumer Products" },
  { title: "$9.95M Balance of Nature Supplements False Advertising Settlement", deadline: "March 11, 2026", withoutProof: "Up to $8.00", withProof: "Up to $30.00", settlementAmount: "9,950,000", category: "Consumer Products" },
  { title: "Sealy 1250 Thread Count False Advertising $750K Class Action Settlement", deadline: "May 12, 2026", withoutProof: "$5 - $40", withProof: "Varies", settlementAmount: "750,000", category: "Consumer Products" },
  { title: "$7.1M La-Z-Boy & Joybird.com Deceptive Advertising Class Action Settlement", deadline: "February 13, 2026", withoutProof: "N/A", withProof: "$115.00", settlementAmount: "7,100,000", category: "Consumer Products" },
  { title: "$33M \"Free Trial\" Wells Fargo Class Action Settlement", deadline: "March 4, 2026", withoutProof: "Varies", withProof: "Varies", settlementAmount: "33,000,000", category: "Financial Services" },
  { title: "Shimano Crankset Recall and Class Action Settlement", deadline: "August 4, 2026", withoutProof: "Varies", withProof: "Varies", settlementAmount: null, category: "Consumer Products" },
  { title: "$1.5 Billion Anthropic AI Copyright Infringement Settlement", deadline: "March 26, 2026", withoutProof: "N/A", withProof: "$3,000", settlementAmount: "1,500,000,000", category: "Technology" },
  { title: "Ram EcoDiesel EGR Cooler Class Action Settlement", deadline: "May 16, 2026", withoutProof: "N/A", withProof: "Warranty Extension + Reimbursement", settlementAmount: null, category: "Automotive" },
  { title: "Snapchat $65M Snap Stock Investors Securities Class Action Settlement", deadline: "May 6, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "65,000,000", category: "Financial Services" },
  { title: "$700M Google Play Store Consumer Antitrust Settlement", deadline: "February 19, 2026", withoutProof: "$2.00+", withProof: "$2.00+", settlementAmount: "700,000,000", category: "Technology" },
  { title: "$1.2 Billion Discover Merchant Card Fees Settlement", deadline: "May 18, 2026", withoutProof: "Varies", withProof: "Varies", settlementAmount: "1,200,000,000", category: "Financial Services" },
  { title: "Jaguar Land Rover Turbocharger Class Action Settlement", deadline: "February 19, 2026", withoutProof: "Warranty Extension", withProof: "Up to $12,000", settlementAmount: null, category: "Automotive" },
  { title: "Rheem Water Heater Drain Valve Class Action Settlement", deadline: "March 20, 2026", withoutProof: "N/A", withProof: "$1,500", settlementAmount: null, category: "Consumer Products" },
  { title: "RoundUp Cancer Lawsuits: Who Qualifies - How to File a Claim", deadline: "Ongoing", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Legal Services" },
  { title: "New York Times Subscription Settlement", deadline: "March 3, 2026", withoutProof: "N/A", withProof: "$14.00", settlementAmount: null, category: "Media" },
  { title: "Children Addicted to Video Games - Lawsuit", deadline: "Ongoing", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Legal Services" },
  { title: "LexisNexis $13.5M False Deceased Reports Class Action Settlement", deadline: "May 15, 2026", withoutProof: "N/A", withProof: "$150 - $1,000", settlementAmount: "13,500,000", category: "Data Services" },
  { title: "Receiving Marketing Texts After Saying STOP or Late at Night?", deadline: "Pending", withoutProof: "N/A", withProof: "$500 - $1,500 Per Text Message", settlementAmount: null, category: "Consumer Protection" },
  { title: "$889K Toyota TCPA Spam Text Messages Class Action Settlement", deadline: "Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: "889,000", category: "Consumer Protection" },
  { title: "Papaya Gaming $15M Deceptive Practices Class Action Settlement", deadline: "January 30, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "15,000,000", category: "Gaming" },
  { title: "Nelnet Data Security Settlement $10M Class Action", deadline: "March 5, 2026", withoutProof: "N/A", withProof: "$25.00+", settlementAmount: "10,000,000", category: "Data Security" },
  { title: "Uber, Lyft & Rideshare Abuse - Lawsuits & Investigation", deadline: "Open", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Legal Services" },
  { title: "$750K Ashley HomeStore Pricing Class Action Settlement", deadline: "Feb 10, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "750,000", category: "Consumer Products" },
  { title: "Coming Soon: Social Security SSA Class Action Lawsuit", deadline: "N/A", withoutProof: "N/A", withProof: "Pending", settlementAmount: null, category: "Government Services" },
  { title: "New Data Breach Class Actions - January 2026", deadline: "Open to Claims", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Data Security" },
  { title: "$625K Educative Automatic Renewal Law Class Action Settlement", deadline: "Feb 13, 2026", withoutProof: "N/A", withProof: "$11.93 - $23.86", settlementAmount: "625,000", category: "Education" },
  { title: "$1.4M Nationwide Pet Insurance Robocall Spam Class Action Settlement", deadline: "March 11, 2026", withoutProof: "N/A", withProof: "$17.50", settlementAmount: "1,400,000", category: "Insurance" },
  { title: "First Choice Dental Data Breach $1.225M Class Action Settlement", deadline: "January 28, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Healthcare" },
  { title: "California Labor Workers' Rights - Lawsuits & Investigations", deadline: "Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Employment" },
  { title: "$30M 23andMe Data Breach Class Action Settlement", deadline: "February 17, 2026", withoutProof: "N/A", withProof: "$165+", settlementAmount: "30,000,000", category: "Data Security" },
  { title: "Kaiser Permanente Spam Texts $10.5M Class Action Settlement", deadline: "February 12, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "10,500,000", category: "Healthcare" },
  { title: "Watson Clinic Data Breach $10M Class Action Settlement", deadline: "February 5, 2026", withoutProof: "N/A", withProof: "Up to $6,500", settlementAmount: "10,000,000", category: "Healthcare" },
  { title: "$7.3M Hormel and Seaboard Pork Class Action Settlement", deadline: "Pending", withoutProof: "N/A", withProof: "Pending", settlementAmount: "7,300,000", category: "Consumer Products" },
  { title: "Anker Power Bank Recall", deadline: "Varies", withoutProof: "N/A", withProof: "$30.00+", settlementAmount: null, category: "Consumer Products" },
  { title: "$12M Citigroup HSBC RBC Morgan Stanley Investment Bonds Settlement", deadline: "Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: "12,000,000", category: "Financial Services" },
  { title: "Lemonaid Health User Tracking Telehealth $3.25M Class Action Settlement", deadline: "February 23, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "3,250,000", category: "Healthcare" },
  { title: "America Cash Advance Data Breach $7.75M Class Action Settlement", deadline: "Feb 2, 2026", withoutProof: "N/A", withProof: "Up to $5,000", settlementAmount: "7,750,000", category: "Financial Services" },
  { title: "Clorox® Pine-Sol® Voluntary Recall", deadline: "Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Consumer Products" },
  { title: "Aura Frames Consumer Privacy Class Action Settlement", deadline: "February 2, 2026", withoutProof: "$13.28", withProof: "$13.28", settlementAmount: null, category: "Consumer Products" },
  { title: "$1.88M Duly Health Privacy Tracking Class Action Settlement", deadline: "March 2, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "1,880,000", category: "Healthcare" },
  { title: "PHH Mortgage Insurance Kickbacks Class Action Settlement", deadline: "August 11, 2026", withoutProof: "N/A", withProof: "$875.00", settlementAmount: null, category: "Financial Services" },
  { title: "8.4M Tide Pods Laundry Detergent Procter & Gamble Recall", deadline: "Pending", withoutProof: "N/A", withProof: "Up To $30.00 Per Unit", settlementAmount: null, category: "Consumer Products" },
  { title: "Oklahoma Earthquakes Class Action Settlements", deadline: "January 25, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Legal Services" },
  { title: "Toyota Camry Air Conditioning Class Action Settlement", deadline: "Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Automotive" },
  { title: "$500M Packaged Bread Price Gouging Class Action Canada", deadline: "Pending", withoutProof: "N/A", withProof: "N/A", settlementAmount: "500,000,000", category: "Consumer Products" },
  { title: "$950K Keurig K-Supreme Coffee Maker Settlement", deadline: "September 30, 2027", withoutProof: "N/A", withProof: "$250.00", settlementAmount: "950,000", category: "Consumer Products" },
  { title: "Kentucky SpinX Gambling App Class Action Settlement", deadline: "February 16, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Gaming" },
  { title: "$30M Ford Focus & Ford Fiesta Transmission Class Action Settlement", deadline: "Varies", withoutProof: "N/A", withProof: "$2,325", settlementAmount: "30,000,000", category: "Automotive" },
  { title: "SeaWorld Annual Pass Automatic Renewal $1.5M Settlement", deadline: "Pending", withoutProof: "N/A", withProof: "Pro Rata Share", settlementAmount: "1,500,000", category: "Entertainment" },
  { title: "Home Depot Point of Sale Accessibility Settlement", deadline: "N/A", withoutProof: "N/A", withProof: "N/A", settlementAmount: null, category: "Retail" },
  { title: "Boohoo Website Fake Sales Class Action Lawsuit", deadline: "N/A", withoutProof: "N/A", withProof: "$10 Gift Card", settlementAmount: null, category: "Retail" },
  { title: "Target $4.6M NJ Distribution Center Wage Settlement", deadline: "N/A", withoutProof: "N/A", withProof: "Varies", settlementAmount: "4,600,000", category: "Employment" },
  { title: "$10M Nissan Transmission Class Action Settlement", deadline: "30 Days After Repair", withoutProof: "N/A", withProof: "$1,500 - $5,000", settlementAmount: "10,000,000", category: "Automotive" },
  { title: "300K Honda and Acura Vehicle Recall", deadline: "Pending", withoutProof: "N/A", withProof: "Reimbursement", settlementAmount: null, category: "Automotive" },
  { title: "$8.5 Million Mitsubishi Airbag Class Action Settlement", deadline: "May 8, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "8,500,000", category: "Automotive" },
  { title: "$78.5 Million Toyota Airbag Class Action Settlement", deadline: "December 16, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "78,500,000", category: "Automotive" },
  { title: "$1.5M Traeger Wood Pellets Class Action Settlement", deadline: "July 30, 2026", withoutProof: "$3.00", withProof: "N/A", settlementAmount: "1,500,000", category: "Consumer Products" },
  { title: "$4.5M Hearthside Illinois Child Labor Settlement", deadline: "November 20, 2026", withoutProof: "N/A", withProof: "Varies", settlementAmount: "4,500,000", category: "Employment" },
  { title: "TBJ Drywall and Taping Unpaid Wages Illinois Settlement", deadline: "January 11, 2028", withoutProof: "N/A", withProof: "Varies", settlementAmount: null, category: "Employment" },
  { title: "Sanyo Solar Panels Class Action Settlement", deadline: "December 31, 2029", withoutProof: "N/A", withProof: "$700 Per Panel", settlementAmount: null, category: "Energy" },
  { title: "Dodge Grand Caravan Sliding Door Class Action Settlement", deadline: "Pending", withoutProof: "N/A", withProof: "Reimbursement", settlementAmount: null, category: "Automotive" },
  { title: "$78.75M Delta Airlines Flight DL89 Class Action Settlement", deadline: "Feb 6, 2026", withoutProof: "N/A", withProof: "Pending", settlementAmount: "78,750,000", category: "Travel" },
  { title: "$60M United® Southwest® Delta® American Airlines®", deadline: "Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: "60,000,000", category: "Travel" },
  { title: "BowFlex Adjustable Dumbbells Recall", deadline: "Varies", withoutProof: "N/A", withProof: "Refund, Voucher, Fitness Membership", settlementAmount: null, category: "Consumer Products" },
  { title: "Toyota Bluetooth Echo Hands-Free Class Action Settlement", deadline: "Pending", withoutProof: "N/A", withProof: "N/A", settlementAmount: null, category: "Automotive" },
  { title: "$582 Million Generic Drugs End-Payer and AG Consumer Settlements", deadline: "Pending", withoutProof: "Pending", withProof: "Pending", settlementAmount: "582,000,000", category: "Healthcare" },
  { title: "$2.67M BCBS Class Action Settlement", deadline: "Payments Pending", withoutProof: "N/A", withProof: "Varies", settlementAmount: "2,670,000", category: "Insurance" },
];

// Helper functions
function extractCompanyName(title) {
  const companies = [
    "Belkin", "Bayer", "Michael Kors", "Energy Drink", "DraftKings", "FanDuel", "Beef", 
    "Balance of Nature", "Sealy", "La-Z-Boy", "Joybird", "Wells Fargo", "Shimano", 
    "Anthropic", "Ram", "EcoDiesel", "Snapchat", "Google", "Discover", "Jaguar", 
    "Land Rover", "Rheem", "RoundUp", "New York Times", "LexisNexis", "Toyota", 
    "Papaya Gaming", "Nelnet", "Uber", "Lyft", "Ashley HomeStore", "Social Security", 
    "Educative", "Nationwide", "First Choice Dental", "23andMe", "Kaiser Permanente", 
    "Watson Clinic", "Hormel", "Seaboard", "Anker", "Citigroup", "HSBC", "RBC", 
    "Morgan Stanley", "Lemonaid Health", "America Cash Advance", "Clorox", "Pine-Sol", 
    "Aura Frames", "Duly Health", "PHH Mortgage", "Tide", "Procter & Gamble", 
    "Toyota Camry", "Keurig", "Kentucky SpinX", "Ford", "SeaWorld", "Home Depot", 
    "Boohoo", "Target", "Nissan", "Honda", "Acura", "Mitsubishi", "Traeger", 
    "Hearthside", "TBJ Drywall", "Sanyo", "Dodge", "Delta Airlines", "United", 
    "Southwest", "American Airlines", "BowFlex", "BCBS"
  ];
  
  for (const company of companies) {
    if (title.includes(company)) return company;
  }
  
  // Try to extract from title patterns
  const match = title.match(/\$[\d.]+[MBK]?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (match) return match[1];
  
  return "Developer will provide";
}

function parsePayoutAmount(amountStr) {
  if (!amountStr || amountStr === "N/A" || amountStr === "Varies" || amountStr === "Pending" || amountStr === "Ongoing" || amountStr === "Open" || amountStr === "Open to Claims") {
    return null;
  }
  
  const numbers = amountStr.match(/[\d,]+\.?\d*/g);
  if (!numbers || numbers.length === 0) return null;
  
  if (amountStr.includes("-") || amountStr.toLowerCase().includes("to")) {
    const min = parseFloat(numbers[0].replace(/,/g, ''));
    const max = numbers[1] ? parseFloat(numbers[1].replace(/,/g, '')) : null;
    return { min, max };
  }
  
  if (amountStr.toLowerCase().includes("up to")) {
    const max = parseFloat(numbers[0].replace(/,/g, ''));
    return { min: null, max };
  }
  
  const amount = parseFloat(numbers[0].replace(/,/g, ''));
  return { min: amount, max: amount };
}

function generateSettlementEntry(settlement, index) {
  const companyName = extractCompanyName(settlement.title);
  const withoutProofPayout = parsePayoutAmount(settlement.withoutProof);
  const withProofPayout = parsePayoutAmount(settlement.withProof);
  
  const proofRequired = settlement.withoutProof === "N/A" && settlement.withProof !== "N/A";
  
  let payoutDescription = "Eligible class members may receive compensation based on the following:\n";
  if (settlement.withoutProof !== "N/A" && settlement.withoutProof !== "Varies" && settlement.withoutProof !== "Pending") {
    payoutDescription += `• Without Proof of Purchase: ${settlement.withoutProof}\n`;
  }
  if (settlement.withProof !== "N/A" && settlement.withProof !== "Varies" && settlement.withProof !== "Pending") {
    payoutDescription += `• With Proof of Purchase: ${settlement.withProof}\n`;
  }
  payoutDescription += "\nActual payout amounts may vary based on the number of valid claims submitted and other factors described in the settlement notice.";
  
  const summary = `You may be eligible to participate in this class action settlement${settlement.settlementAmount ? ` with a total settlement fund of $${settlement.settlementAmount.replace(/,/g, ',')}` : ''}. ${proofRequired ? 'Proof of purchase may be required for certain benefits.' : 'You may be eligible for compensation with or without proof of purchase, depending on the specific terms of the settlement.'}`;
  
  const pageFullText = `${settlement.title}\n\n${summary}\n\n${payoutDescription}\n\nClaim Deadline: ${settlement.deadline}\n\nThis settlement addresses allegations related to the products or services involved. The settlement is subject to court approval, and payments will be distributed after final approval and resolution of any appeals.\n\nFor more information and to file a claim, please visit the official settlement website.`;
  
  const slug = settlement.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return {
    title: settlement.title,
    detail_url: `https://openclassactions.com/settlements/${slug}.php`,
    full_settlement_title: settlement.title,
    company_defendant_name: companyName,
    company_logo_url: "https://www.openclassactions.com/assets/images/default-logo.webp",
    claim_deadline_date: settlement.deadline,
    minimum_payout_amount: withoutProofPayout?.min || withProofPayout?.min || null,
    maximum_payout_amount: withoutProofPayout?.max || withProofPayout?.max || null,
    payout_calculation_description: payoutDescription,
    direct_claim_filing_url: `https://www.settlement-claim.com/claim?utm_source=openclassactions.com&settlement=${encodeURIComponent(settlement.title)}`,
    proof_of_purchase_required: proofRequired,
    max_proofs_allowed: null,
    settlement_amount_total: settlement.settlementAmount,
    category: settlement.category,
    case_number: `CASE-${String(index + 1).padStart(6, '0')}`,
    court: "Court information will be provided",
    settlement_summary: summary,
    page_full_text: pageFullText
  };
}

// Generate all settlements
const generatedSettlements = settlementsData.map((settlement, index) => 
  generateSettlementEntry(settlement, index)
);

// Read existing file
const existingPath = path.join(__dirname, '../public/settlements-data.json');
let existingData;
try {
  existingData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
} catch (e) {
  existingData = { settlements: [] };
}

// Merge: keep existing, add new ones that don't exist
const existingTitles = new Set(existingData.settlements.map(s => s.title));
const newSettlements = generatedSettlements.filter(s => !existingTitles.has(s.title));

existingData.settlements = [...existingData.settlements, ...newSettlements];

// Write back
fs.writeFileSync(existingPath, JSON.stringify(existingData, null, 2), 'utf8');
console.log(`Added ${newSettlements.length} new settlements. Total: ${existingData.settlements.length}`);
