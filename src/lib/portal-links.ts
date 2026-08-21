// Official portal URLs for each exam category
// Admin clicks these to open the portal and fill the form manually

export const PORTAL_LINKS: Record<string, { url: string; name: string }> = {
  // SSC Exams
  'SSC': { url: 'https://ssc.nic.in', name: 'Staff Selection Commission' },
  
  // Railway Exams
  'RAILWAY': { url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', name: 'Indian Railways (RRB)' },
  
  // Banking Exams
  'BANKING': { url: 'https://ibpsonline.ibps.in', name: 'IBPS Banking Portal' },
  
  // Engineering Exams
  'JEE': { url: 'https://jeemain.nta.ac.in', name: 'JEE Main (NTA)' },
  'NEET': { url: 'https://neet.nta.ac.in', name: 'NEET (NTA)' },
  
  // UPSC
  'UPSC': { url: 'https://upsc.gov.in', name: 'Union Public Service Commission' },
  
  // State Exams
  'UPPSC': { url: 'https://uppsc.up.nic.in', name: 'UP Public Service Commission' },
  'BPSC': { url: 'https://bpsc.bih.nic.in', name: 'Bihar Public Service Commission' },
  
  // University Admissions
  'ADMISSION': { url: '#', name: 'University Portal' },
  
  // Scholarships
  'SCHOLARSHIP': { url: 'https://scholarships.gov.in', name: 'National Scholarship Portal' },
  
  // Other
  'DEFAULT': { url: 'https://google.com', name: 'Official Portal' },
};

export function getPortalLink(category: string): { url: string; name: string } {
  const normalized = category.toUpperCase().replace(/\s+/g, '');
  
  // Direct match
  for (const [key, value] of Object.entries(PORTAL_LINKS)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return PORTAL_LINKS.DEFAULT;
}

// Form field labels for copy-paste friendly display
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
