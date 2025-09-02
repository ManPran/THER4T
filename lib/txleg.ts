import { Bill } from '@/app/api/txleg/route';

export interface FetchActiveBillsOptions {
  chamber?: "house" | "senate";
  active?: boolean;
}

export interface BillsResponse {
  bills: Bill[];
  isStale: boolean;
  isFallback: boolean;
  lastUpdated: string;
}

/**
 * Fetch active bills from the Texas legislative API
 */
export async function fetchActiveBills(options: FetchActiveBillsOptions = {}): Promise<BillsResponse> {
  const { chamber, active = true } = options;
  
  try {
    const params = new URLSearchParams();
    if (chamber) params.append('chamber', chamber);
    if (active) params.append('active', 'true');
    
    const response = await fetch(`/api/txleg?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const bills = await response.json();
    
    // Since the API returns an array directly, wrap it in the expected format
    if (Array.isArray(bills)) {
      return {
        bills,
        isStale: false,
        isFallback: false,
        lastUpdated: new Date().toISOString(),
      };
    }
    
    // Fallback if response structure is unexpected
    return {
      bills: [],
      isStale: false,
      isFallback: true,
      lastUpdated: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Error fetching active bills:', error);
    
    // Return fallback with HB 1481 and new bills
    const fallbackBills = [getHB1481Fallback(), ...getNewBillsFallback()];
    return {
      bills: fallbackBills,
      isStale: false,
      isFallback: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Get HB 1481 data as fallback when API fails
 */
export function getHB1481Fallback(): Bill {
  return {
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
}

/**
 * Get new bills data as fallback when API fails
 */
export function getNewBillsFallback(): Bill[] {
  return [
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
}

/**
 * Normalize HB 1481 data to ensure consistency
 */
export function normalizeHB1481(bills: Bill[]): Bill[] {
  const hb1481Index = bills.findIndex(b => b.billNumber === 'HB 1481');
  
  if (hb1481Index >= 0) {
    // Update existing HB 1481 with canonical data
    bills[hb1481Index] = getHB1481Fallback();
  } else {
    // Add HB 1481 if not present
    bills.unshift(getHB1481Fallback());
  }
  
  return bills;
}

/**
 * Format timestamp for display in America/Chicago timezone
 */
export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return 'Unknown time';
  }
}

/**
 * Get time ago string (e.g., "2 hours ago")
 */
export function getTimeAgo(isoString: string): string {
  try {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      } else {
        return 'Just now';
      }
    }
  } catch {
    return 'Unknown time';
  }
}

/**
 * Get status badge color based on bill status
 */
export function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  
  switch (normalizedStatus) {
    case 'enrolled':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'passed-house':
    case 'passed-senate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'on-calendar':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in-committee':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'introduced':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'blocked-by-court':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'enacted':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get chamber display name
 */
export function getChamberDisplay(chamber: "house" | "senate"): string {
  return chamber === 'house' ? 'House' : 'Senate';
}

/**
 * Get chamber abbreviation
 */
export function getChamberAbbr(chamber: "house" | "senate"): string {
  return chamber === 'house' ? 'H' : 'S';
}
