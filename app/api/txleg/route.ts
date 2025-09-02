import { NextRequest, NextResponse } from 'next/server';

// Types for legislative data
export type Bill = {
  billNumber: string; // e.g., "HB 1481"
  chamber: "house" | "senate";
  title: string;
  summary: string;
  status: string; // short code + readable
  lastAction: string;
  lastActionAt: string; // ISO
  url: string; // TLO canonical page if resolvable, else LegiScan bill URL
  subjects: string[];
  session: string; // e.g., "89(R)" or special
};

// HB 1481 hardcoded data from TLO enrolled text
const HB1481_DATA: Bill = {
  billNumber: "HB 1481",
  chamber: "house",
  title: "Relating to the possession and use of personal communication devices by students in public schools",
  summary: "Prohibits students from possessing or using personal communication devices during the school day, requires secure storage, with exceptions for IEP/medical/safety needs. Effective September 1, 2025.",
  status: "Enrolled",
  lastAction: "Enrolled in House",
  lastActionAt: "2025-08-20T00:00:00.000Z",
  url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB1481",
  subjects: ["Education", "Student Conduct", "Technology"],
  session: "89(R)"
};

// New bills data based on user specifications
const NEW_BILLS: Bill[] = [
  {
    billNumber: "HB 4",
    chamber: "house",
    title: "Relating to congressional redistricting",
    summary: "House Bill 4 passed along party lines, a controversial redistricting plan that could add up to five new Republican-leaning congressional districts. Democrats argue that the plan dilutes minority voting power and violates the Voting Rights Act, while Republicans assert that the map enhances GOP representation.",
    status: "Passed House",
    lastAction: "Passed House along party lines, moves to Senate",
    lastActionAt: "2025-08-15T00:00:00.000Z",
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB4",
    subjects: ["Redistricting", "Congressional Districts", "Voting Rights"],
    session: "89(R)"
  },
  {
    billNumber: "SB 2",
    chamber: "senate",
    title: "Relating to education savings accounts (ESAs)",
    summary: "Senate Bill 2 establishes an Education Savings Account program, providing eligible families with funds to use for private school tuition, homeschooling, and other educational expenses. The program is set to begin in the 2026-2027 school year and aims to offer more educational choices to Texas families.",
    status: "In Committee",
    lastAction: "Referred to Education Committee",
    lastActionAt: "2025-08-12T00:00:00.000Z",
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB2",
    subjects: ["Education", "School Choice", "ESAs", "Vouchers"],
    session: "89(R)"
  },
  {
    billNumber: "SB 10",
    chamber: "senate",
    title: "Relating to display of the Ten Commandments in schools",
    summary: "Senate Bill 10 mandates that public school classrooms display a 16-by-20-inch poster of the Ten Commandments. The law has faced legal challenges from various religious groups and parents who argue that it violates the constitutional separation of church and state. A federal judge temporarily blocked the law, and Texas Attorney General Ken Paxton has appealed the decision.",
    status: "Blocked by Court",
    lastAction: "Temporarily blocked by federal judge, AG appealing",
    lastActionAt: "2025-08-10T00:00:00.000Z",
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB10",
    subjects: ["Education", "Religion", "First Amendment", "Separation of Church and State"],
    session: "89(R)"
  },
  {
    billNumber: "HB 229",
    chamber: "house",
    title: "Relating to definition of sex",
    summary: "House Bill 229 defines 'male' and 'female' based on reproductive capabilities and requires state records to reflect this binary classification. Critics argue that the bill discriminates against transgender and intersex individuals and contradicts medical science and constitutional principles.",
    status: "In Committee",
    lastAction: "Referred to State Affairs Committee",
    lastActionAt: "2025-08-08T00:00:00.000Z",
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB229",
    subjects: ["Civil Rights", "Gender Identity", "Transgender Rights", "State Records"],
    session: "89(R)"
  },
  {
    billNumber: "SB 15",
    chamber: "senate",
    title: "Relating to police misconduct records",
    summary: "Senate Bill 15 allows law enforcement agencies to retain and share records of alleged misconduct, even when those allegations are determined to be unsupported by evidence. Critics argue that this infringes on due process and could harm officers' reputations without formal adjudication.",
    status: "In Committee",
    lastAction: "Referred to Criminal Justice Committee",
    lastActionAt: "2025-08-05T00:00:00.000Z",
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB15",
    subjects: ["Law Enforcement", "Police Accountability", "Due Process", "Criminal Justice"],
    session: "89(R)"
  },
  {
    billNumber: "SB 8",
    chamber: "senate",
    title: "Relating to abortion restrictions (Texas Heartbeat Act)",
    summary: "Senate Bill 8, known as the Texas Heartbeat Act, bans most abortions after approximately six weeks of pregnancy. The law allows private citizens to sue anyone who performs or aids an abortion in violation of the law. It has faced legal challenges and has been associated with a rise in maternal mortality in Texas.",
    status: "Enacted",
    lastAction: "Law enacted, facing legal challenges",
    lastActionAt: "2025-08-01T00:00:00.000Z",
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB8",
    subjects: ["Abortion", "Reproductive Rights", "Healthcare", "Civil Lawsuits"],
    session: "89(R)"
  }
];

// Cache for fallback data
let cachedBills: Bill[] = [];
let cacheTimestamp = 0;
let cacheETag = '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chamber = searchParams.get('chamber') as "house" | "senate" | null;
  const active = searchParams.get('active') === 'true';

  try {
    const bills = await fetchActiveBills(chamber, active);
    
    // Always inject HB 1481 if it's a house bill or no chamber filter
    if (!chamber || chamber === 'house') {
      const existingIndex = bills.findIndex(b => b.billNumber === 'HB 1481');
      if (existingIndex >= 0) {
        bills[existingIndex] = HB1481_DATA;
      } else {
        bills.unshift(HB1481_DATA);
      }
    }

    // Pin HB 1481 to top if present
    const pinnedBills = bills.filter(b => b.billNumber === 'HB 1481');
    const otherBills = bills.filter(b => b.billNumber !== 'HB 1481');
    const sortedBills = [...pinnedBills, ...otherBills.sort((a, b) => 
      new Date(b.lastActionAt).getTime() - new Date(a.lastActionAt).getTime()
    )];

    const response = NextResponse.json(sortedBills, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'ETag': `"${Date.now()}"`,
      },
    });

    // Update cache
    cachedBills = sortedBills;
    cacheTimestamp = Date.now();
    cacheETag = response.headers.get('ETag') || '';

    return response;

  } catch (error) {
    console.error('Error fetching legislative data:', error);
    
    // Return cached data if available
    if (cachedBills.length > 0) {
      return NextResponse.json(cachedBills, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'ETag': cacheETag,
          'X-Cache-Status': 'stale',
        },
      });
    }

    // Fallback to sample data if no cache
    const fallbackBills = [HB1481_DATA];
    
    // Add new bills for the requested chamber
    if (chamber === 'house') {
      fallbackBills.push(...NEW_BILLS.filter(b => b.chamber === 'house'));
    } else if (chamber === 'senate') {
      fallbackBills.push(...NEW_BILLS.filter(b => b.chamber === 'senate'));
    } else {
      fallbackBills.push(...NEW_BILLS);
    }
    
    return NextResponse.json(fallbackBills, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'ETag': `"fallback-${Date.now()}"`,
        'X-Cache-Status': 'fallback',
      },
    });
  }
}

async function fetchActiveBills(chamber: "house" | "senate" | null, active: boolean): Promise<Bill[]> {
  const bills: Bill[] = [];

  // Try LegiScan API if key is available
  if (process.env.LEGISCAN_API_KEY) {
    try {
      const legiScanBills = await fetchLegiScanBills(chamber);
      bills.push(...legiScanBills);
    } catch (error) {
      console.warn('LegiScan API failed, falling back to TLO RSS:', error);
    }
  }

  // Always try TLO RSS as fallback
  try {
    const tloBills = await fetchTLORSS(chamber);
    bills.push(...tloBills);
  } catch (error) {
    console.warn('TLO RSS failed:', error);
  }

  // If no bills found from external sources, use new bills data
  if (bills.length === 0) {
    console.log('No external bills found, using new bills data');
    if (chamber === 'house') {
      bills.push(...NEW_BILLS.filter(b => b.chamber === 'house'));
    } else if (chamber === 'senate') {
      bills.push(...NEW_BILLS.filter(b => b.chamber === 'senate'));
    } else {
      bills.push(...NEW_BILLS);
    }
  }

  // Remove duplicates and filter by active status if requested
  const uniqueBills = removeDuplicateBills(bills);
  
  if (active) {
    return uniqueBills.filter(bill => 
      ['introduced', 'in-committee', 'on-calendar', 'passed-house', 'passed-senate'].includes(
        bill.status.toLowerCase().replace(/\s+/g, '-')
      )
    );
  }

  return uniqueBills;
}

async function fetchLegiScanBills(chamber: "house" | "senate" | null): Promise<Bill[]> {
  const apiKey = process.env.LEGISCAN_API_KEY;
  if (!apiKey) return [];

  try {
    // Fetch Texas bills from LegiScan
    const response = await fetch(`https://api.legiscan.com/?key=${apiKey}&op=getMasterList&state=TX`, {
      timeout: 10000,
    });

    if (!response.ok) throw new Error(`LegiScan API error: ${response.status}`);

    const data = await response.json();
    
    if (data.status !== 'OK') throw new Error(`LegiScan API error: ${data.status}`);

    const bills: Bill[] = [];
    
    for (const bill of data.results || []) {
      // Filter by chamber if specified
      if (chamber && bill.bill_number.toLowerCase().startsWith(chamber === 'house' ? 'hb' : 'sb')) {
        bills.push({
          billNumber: bill.bill_number,
          chamber: bill.bill_number.toLowerCase().startsWith('hb') ? 'house' : 'senate',
          title: bill.title || 'No title available',
          summary: bill.description || 'No summary available',
          status: bill.status || 'Unknown',
          lastAction: bill.last_action || 'No action recorded',
          lastActionAt: bill.last_action_date || new Date().toISOString(),
          url: `https://legiscan.com/TX/bill/${bill.bill_id}`,
          subjects: bill.subjects || [],
          session: bill.session_name || '89(R)',
        });
      }
    }

    return bills;

  } catch (error) {
    console.error('LegiScan API error:', error);
    return [];
  }
}

async function fetchTLORSS(chamber: "house" | "senate" | null): Promise<Bill[]> {
  try {
    // Fetch TLO RSS feeds for recent activity
    const rssUrls = [
      'https://capitol.texas.gov/MyTLO/RSS/NewBills.xml',
      'https://capitol.texas.gov/MyTLO/RSS/Calendars.xml',
    ];

    const bills: Bill[] = [];

    for (const url of rssUrls) {
      try {
        const response = await fetch(url, { timeout: 8000 });
        if (!response.ok) continue;

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const items = xml.querySelectorAll('item');
        
        for (const item of items) {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Extract bill number from title (HB #### or SB ####)
          const billMatch = title.match(/(HB|SB)\s+(\d+)/i);
          if (!billMatch) continue;

          const billNumber = `${billMatch[1].toUpperCase()} ${billMatch[2]}`;
          const billChamber = billMatch[1].toUpperCase() === 'HB' ? 'house' : 'senate';
          
          // Filter by chamber if specified
          if (chamber && billChamber !== chamber) continue;

          bills.push({
            billNumber,
            chamber: billChamber,
            title: title.replace(/^(HB|SB)\s+\d+\s*[-–]\s*/i, '').trim(),
            summary: description || 'No summary available',
            status: 'Introduced',
            lastAction: 'Filed',
            lastActionAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            url: `https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=${billNumber.replace(' ', '')}`,
            subjects: [],
            session: '89(R)',
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch RSS from ${url}:`, error);
      }
    }

    return bills;

  } catch (error) {
    console.error('TLO RSS error:', error);
    return [];
  }
}

function removeDuplicateBills(bills: Bill[]): Bill[] {
  const seen = new Set<string>();
  return bills.filter(bill => {
    const key = `${bill.billNumber}-${bill.chamber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Fetch additional civic data from Google Civics API if available
async function fetchCivicsData(): Promise<any[]> {
  if (!process.env.CIVICS_API_KEY) {
    return []
  }

  try {
    // Get Texas representatives and civic info
    const response = await fetch(
      `https://www.googleapis.com/civicinfo/v2/representatives?key=${process.env.CIVICS_API_KEY}&address=Texas&levels=state&roles=legislatorUpperBody&roles=legislatorLowerBody`,
      { timeout: 8000 }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    return data.officials || []
  } catch (error) {
    console.error('Error fetching Civics API data:', error)
    return []
  }
}

// Mock DOMParser for server-side XML parsing
class DOMParser {
  parseFromString(str: string, contentType: string) {
    // Simple XML parsing for RSS feeds
    const items: any[] = [];
    
    // Extract items from RSS XML
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(str)) !== null) {
      const itemContent = match[1];
      const item: any = {};
      
      // Extract title
      const titleMatch = itemContent.match(/<title>(.*?)<\/title>/);
      if (titleMatch) item.title = titleMatch[1];
      
      // Extract description
      const descMatch = itemContent.match(/<description>(.*?)<\/description>/);
      if (descMatch) item.description = descMatch[1];
      
      // Extract pubDate
      const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
      if (dateMatch) item.pubDate = dateMatch[1];
      
      items.push(item);
    }
    
    return {
      querySelectorAll: (selector: string) => {
        if (selector === 'item') return items;
        return [];
      }
    };
  }
}
