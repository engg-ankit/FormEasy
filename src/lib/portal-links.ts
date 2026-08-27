// ─── Official Portal URLs — Auto-detect by category/title ─────
// When admin selects a category or types a title, the portal URL is auto-filled

export interface PortalInfo {
  url: string;
  name: string;
  icon?: string;
}

// ─── Category → Portal mapping ────────────────────────────────
const PORTAL_MAP: Record<string, PortalInfo> = {
  // SSC Exams
  'SSC': { url: 'https://ssc.nic.in', name: 'Staff Selection Commission', icon: '📋' },
  'SSC CGL': { url: 'https://ssc.nic.in', name: 'SSC CGL Portal', icon: '📋' },
  'SSC CHSL': { url: 'https://ssc.nic.in', name: 'SSC CHSL Portal', icon: '📋' },
  'SSC MTS': { url: 'https://ssc.nic.in', name: 'SSC MTS Portal', icon: '📋' },
  'SSC GD': { url: 'https://ssc.nic.in', name: 'SSC GD Portal', icon: '📋' },
  'SSC JE': { url: 'https://ssc.nic.in', name: 'SSC JE Portal', icon: '📋' },
  'SSC STENO': { url: 'https://ssc.nic.in', name: 'SSC Stenographer Portal', icon: '📋' },

  // UPSC
  'UPSC': { url: 'https://upsc.gov.in', name: 'Union Public Service Commission', icon: '🏛️' },
  'UPSC CSE': { url: 'https://upsc.gov.in', name: 'UPSC Civil Services', icon: '🏛️' },
  'UPSC IAS': { url: 'https://upsc.gov.in', name: 'UPSC IAS Portal', icon: '🏛️' },
  'UPSC IPS': { url: 'https://upsc.gov.in', name: 'UPSC IPS Portal', icon: '🏛️' },
  'UPSC NDA': { url: 'https://upsc.gov.in', name: 'UPSC NDA Portal', icon: '🏛️' },
  'UPSC CDS': { url: 'https://upsc.gov.in', name: 'UPSC CDS Portal', icon: '🏛️' },
  'UPSC ESE': { url: 'https://upsc.gov.in', name: 'UPSC Engineering Services', icon: '🏛️' },
  'UPSC CAPF': { url: 'https://upsc.gov.in', name: 'UPSC CAPF Portal', icon: '🏛️' },

  // Railway
  'RAILWAY': { url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', name: 'Indian Railways (RRB)', icon: '🚂' },
  'RRB': { url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', name: 'Railway Recruitment Board', icon: '🚂' },
  'RRB NTPC': { url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', name: 'RRB NTPC Portal', icon: '🚂' },
  'RRB ALP': { url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', name: 'RRB ALP Portal', icon: '🚂' },
  'RRB GROUP D': { url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', name: 'RRB Group D Portal', icon: '🚂' },
  'RRB JE': { url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', name: 'RRB JE Portal', icon: '🚂' },

  // Banking
  'BANKING': { url: 'https://ibpsonline.ibps.in', name: 'IBPS Banking Portal', icon: '🏦' },
  'IBPS': { url: 'https://ibpsonline.ibps.in', name: 'IBPS Portal', icon: '🏦' },
  'IBPS PO': { url: 'https://ibpsonline.ibps.in', name: 'IBPS PO Portal', icon: '🏦' },
  'IBPS CLERK': { url: 'https://ibpsonline.ibps.in', name: 'IBPS Clerk Portal', icon: '🏦' },
  'IBPS RRB': { url: 'https://ibpsonline.ibps.in', name: 'IBPS RRB Portal', icon: '🏦' },
  'SBI PO': { url: 'https://sbi.co.in/web/precert/sbi-po', name: 'SBI PO Portal', icon: '🏦' },
  'SBI CLERK': { url: 'https://sbi.co.in', name: 'SBI Clerk Portal', icon: '🏦' },
  'RBI': { url: 'https://rbi.org.in', name: 'Reserve Bank of India', icon: '🏦' },
  'RBI GRADE B': { url: 'https://rbi.org.in', name: 'RBI Grade B Portal', icon: '🏦' },

  // Engineering / Medical
  'JEE': { url: 'https://jeemain.nta.ac.in', name: 'JEE Main (NTA)', icon: '🎓' },
  'JEE MAIN': { url: 'https://jeemain.nta.ac.in', name: 'JEE Main (NTA)', icon: '🎓' },
  'JEE ADVANCED': { url: 'https://jeeadv.ac.in', name: 'JEE Advanced Portal', icon: '🎓' },
  'NEET': { url: 'https://neet.nta.ac.in', name: 'NEET (NTA)', icon: '🏥' },
  'NEET UG': { url: 'https://neet.nta.ac.in', name: 'NEET UG (NTA)', icon: '🏥' },
  'NEET PG': { url: 'https://natboard.edu.in', name: 'NEET PG (NBE)', icon: '🏥' },
  'GATE': { url: 'https://gate.iitd.ac.in', name: 'GATE Portal', icon: '🎓' },
  'BITSAT': { url: 'https://bitsadmission.com', name: 'BITS Admission', icon: '🎓' },
  'VITEEE': { url: 'https://viteee.vit.ac.in', name: 'VITEEE Portal', icon: '🎓' },
  'WBJEE': { url: 'https://wbjeeb.nic.in', name: 'WBJEE Portal', icon: '🎓' },
  'MHT CET': { url: 'https://cetcell.mahacet.org', name: 'MHT CET Portal', icon: '🎓' },
  'COMEDK': { url: 'https://www.comedk.org', name: 'COMEDK Portal', icon: '🎓' },

  // State PSC
  'UPPSC': { url: 'https://uppsc.up.nic.in', name: 'UP Public Service Commission', icon: '🏛️' },
  'BPSC': { url: 'https://bpsc.bih.nic.in', name: 'Bihar Public Service Commission', icon: '🏛️' },
  'MPPSC': { url: 'https://mpsc.mp.gov.in', name: 'MP Public Service Commission', icon: '🏛️' },
  'RPSC': { url: 'https://rpsc.rajasthan.gov.in', name: 'Rajasthan PSC', icon: '🏛️' },
  'APPSC': { url: 'https://appsc.gov.in', name: 'AP Public Service Commission', icon: '🏛️' },
  'TNPSC': { url: 'https://www.tnpsc.gov.in', name: 'Tamil Nadu PSC', icon: '🏛️' },
  'KPSC': { url: 'https://kpsc.kar.nic.in', name: 'Karnataka PSC', icon: '🏛️' },
  'HPPSC': { url: 'https://himppsc.hp.gov.in', name: 'Himachal PSC', icon: '🏛️' },
  'OPSC': { url: 'https://opsc.gov.in', name: 'Odisha PSC', icon: '🏛️' },
  'GPSC': { url: 'https://gpsc.gov.in', name: 'Gujarat PSC', icon: '🏛️' },

  // Defense
  'NDA': { url: 'https://upsc.gov.in', name: 'NDA (UPSC)', icon: '🎖️' },
  'CDS': { url: 'https://upsc.gov.in', name: 'CDS (UPSC)', icon: '🎖️' },
  'AFCAT': { url: 'https://afcat.cdac.in', name: 'AFCAT Portal', icon: '🎖️' },
  'AGNIVEER': { url: 'https://agnipathvayu.cdac.in', name: 'Agniveer Vayu', icon: '🎖️' },
  'AGNIPATH': { url: 'https://agnipathvayu.cdac.in', name: 'Agniveer Portal', icon: '🎖️' },
  'NAA': { url: 'https://www.joinindianarmy.nic.in', name: 'Indian Army', icon: '🎖️' },
  'NAVY': { url: 'https://www.joinindiannavy.gov.in', name: 'Indian Navy', icon: '🎖️' },

  // Teaching
  'CTET': { url: 'https://ctet.nic.in', name: 'CTET Portal', icon: '📚' },
  'UPTET': { url: 'https://updeled.gov.in', name: 'UPTET Portal', icon: '📚' },
  'KVS': { url: 'https://kvsangathan.nic.in', name: 'KVS Portal', icon: '📚' },
  'DSSSB': { url: 'https://dsssb.delhi.gov.in', name: 'DSSSB Portal', icon: '🏛️' },
  'UGC NET': { url: 'https://ugcnet.nta.ac.in', name: 'UGC NET (NTA)', icon: '📚' },
  'REET': { url: 'https://reetbser.com', name: 'REET Portal', icon: '📚' },

  // Scholarships
  'SCHOLARSHIP': { url: 'https://scholarships.gov.in', name: 'National Scholarship Portal', icon: '🎓' },
  'NSP': { url: 'https://scholarships.gov.in', name: 'National Scholarship Portal', icon: '🎓' },
  'PM SCHOLARSHIP': { url: 'https://scholarships.gov.in', name: 'PM Scholarship Portal', icon: '🎓' },

  // University / Admission
  'ADMISSION': { url: '#', name: 'University Portal', icon: '🏫' },
  'CUET': { url: 'https://cuet.nta.nic.in', name: 'CUET UG (NTA)', icon: '🏫' },
  'CLAT': { url: 'https://consortiumofnlus.ac.in', name: 'CLAT Portal', icon: '🏫' },
  'AILET': { url: 'https://nludelhi.ac.in', name: 'AILET (NLU Delhi)', icon: '🏫' },
  'NCHMCT JEE': { url: 'https://nchmjee.nta.nic.in', name: 'NCHMCT JEE', icon: '🏫' },

  // Other Govt
  'BSF': { url: 'https://bsf.gov.in', name: 'BSF Portal', icon: '🎖️' },
  'CRPF': { url: 'https://crpf.gov.in', name: 'CRPF Portal', icon: '🎖️' },
  'CISF': { url: 'https://cisf.gov.in', name: 'CISF Portal', icon: '🎖️' },
  'ITBP': { url: 'https://itbpolice.nic.in', name: 'ITBP Portal', icon: '🎖️' },
  'SSB': { url: 'https://ssb.gov.in', name: 'SSB Portal', icon: '🎖️' },

  // Professional
  'CA': { url: 'https://icai.org', name: 'ICAI (Chartered Accountant)', icon: '💼' },
  'CS': { url: 'https://icsi.edu', name: 'ICSI (Company Secretary)', icon: '💼' },
  'CMA': { url: 'https://icmai.in', name: 'ICMAI (Cost Accountant)', icon: '💼' },
  'BAR': { url: 'https://barcouncilofindia.org', name: 'Bar Council of India', icon: '⚖️' },

  // State Board
  'CBSE': { url: 'https://cbse.gov.in', name: 'CBSE Portal', icon: '📚' },
  'ICSE': { url: 'https://cisce.org', name: 'CISCE Portal', icon: '📚' },

  // Other
  'DEFAULT': { url: 'https://google.com', name: 'Official Portal', icon: '🔗' },
};

// ─── Auto-detect portal from category or title ────────────────
export function getPortalLink(input: string): PortalInfo {
  if (!input) return PORTAL_MAP.DEFAULT;

  const normalized = input.toUpperCase().trim();

  // 1. Direct match (e.g., "SSC CGL" → exact match)
  if (PORTAL_MAP[normalized]) return PORTAL_MAP[normalized];

  // 2. Partial match — check if any key is contained in the input
  for (const [key, value] of Object.entries(PORTAL_MAP)) {
    if (key === 'DEFAULT') continue;
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // 3. Word-level match — check individual words
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (PORTAL_MAP[word]) return PORTAL_MAP[word];
  }

  return PORTAL_MAP.DEFAULT;
}

// ─── All available categories for dropdown ────────────────────
export const EXAM_CATEGORIES = [
  'SSC Exam',
  'UPSC Exam',
  'Railway Exam',
  'Banking Exam',
  'Engineering Exam (JEE/GATE)',
  'Medical Exam (NEET)',
  'State PSC',
  'Defense Exam',
  'Teaching Exam (CTET/TET)',
  'University Admission (CUET)',
  'Scholarship',
  'Professional Certification (CA/CS)',
  'College Registration',
  'Other',
];

// ─── Form field labels for copy-paste friendly display ────────
export const FORM_FIELD_LABELS: Record<string, string> = {
  fullName: 'Full Name',
  fatherName: "Father's Name",
  motherName: "Mother's Name",
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  category: 'Category',
  mobile: 'Mobile Number',
  email: 'Email Address',
  address: 'Address',
  state: 'State',
  district: 'District',
  pincode: 'Pincode',
  educationLevel: 'Education Level',
  boardOrUniversity: 'Board / University',
  yearOfPassing: 'Year of Passing',
  percentage: 'Percentage / CGPA',
  rollNumber: 'Roll Number',
  aadhaarNumber: 'Aadhaar Number',
  panNumber: 'PAN Number',
  alternateMobile: 'Alternate Mobile',
  photograph: 'Photograph',
  signature: 'Signature',
};
