export type DirectoryMember = {
  id: string;
  section: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  email: string;
};

export type DirectoryVendorTier = "standard" | "featured";

export type DirectoryVendor = {
  id: string;
  category: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  website?: string;
  tier: DirectoryVendorTier;
  blurb?: string;
};

export type FrontSectionData = {
  memorialNames: string[];
  memberOfYearCurrent: {
    year: number;
    name: string;
  };
  memberOfYearPast: Array<{
    year: number;
    name: string;
  }>;
  grandMarshalCurrent: {
    year: number;
    name: string;
  };
  grandMarshalPast: Array<{
    year: number;
    name: string;
  }>;
  officers: Array<{
    role: string;
    name: string;
  }>;
  trustees: string[];
};

export const sampleMembers: DirectoryMember[] = [
  {
    id: "m-001",
    section: "Members B",
    fullName: "Brennan, Jimmy",
    addressLine1: "936 Fifth Avenue",
    addressLine2: "New York, NY 10021",
    phone: "212-737-0349",
    email: "jimmybillions@gmail.com",
  },
  {
    id: "m-002",
    section: "Members B",
    fullName: "Brown, Daniel",
    addressLine1: "357 East 60th Street",
    addressLine2: "New York, NY 10022",
    phone: "212-879-8020",
    email: "dbrown1217@yahoo.com",
  },
  {
    id: "m-003",
    section: "Members B",
    fullName: "Burke, Pat",
    addressLine1: "229 East 120th Street",
    addressLine2: "New York, NY 10035",
    phone: "646-672-5190",
    email: "tobiaspburke@gmail.com",
  },
  {
    id: "m-004",
    section: "Members B",
    fullName: "Burke, Seamus",
    addressLine1: "525 East 86th Street Apt. 1A",
    addressLine2: "New York, NY 10028",
    phone: "212-744-0355",
    email: "s.burke@rcn.com",
  },
  {
    id: "m-005",
    section: "Members C",
    fullName: "Conway, Patrick",
    addressLine1: "204 East 92nd Street",
    addressLine2: "New York, NY 10128",
    phone: "646-555-0191",
    email: "pconway@aol.com",
  },
  {
    id: "m-006",
    section: "Members D",
    fullName: "Doyle, Garrett",
    addressLine1: "415 West 52nd Street",
    addressLine2: "New York, NY 10019",
    phone: "212-555-0168",
    email: "garrettdoyle@gmail.com",
  },
  {
    id: "m-007",
    section: "Members F",
    fullName: "Fallon, Anthony",
    addressLine1: "301 East 83rd Street",
    addressLine2: "New York, NY 10028",
    phone: "917-555-0131",
    email: "anthonyfallon@gmail.com",
  },
  {
    id: "m-008",
    section: "Members K",
    fullName: "Keegan, John",
    addressLine1: "60 Riverside Boulevard",
    addressLine2: "New York, NY 10069",
    phone: "212-555-0104",
    email: "jkeegan@icloud.com",
  },
  {
    id: "m-009",
    section: "Members M",
    fullName: "Moore, James",
    addressLine1: "145 East 15th Street",
    addressLine2: "New York, NY 10003",
    phone: "646-555-0125",
    email: "jmoore@outlook.com",
  },
  {
    id: "m-010",
    section: "Members R",
    fullName: "Riordan, Barry",
    addressLine1: "89 Murray Street",
    addressLine2: "New York, NY 10007",
    phone: "212-555-0188",
    email: "barryriordan@gmail.com",
  },
];

export const sampleVendors: DirectoryVendor[] = [
  {
    id: "v-001",
    category: "Painting",
    businessName: "Manhattan Paint & Finish",
    contactName: "Liam O'Connell",
    phone: "212-555-0123",
    email: "office@manhattanpaint.com",
    website: "https://example.com/paint",
    tier: "featured",
    blurb: "High-end interior and exterior painting for residential properties.",
  },
  {
    id: "v-002",
    category: "Plumbing",
    businessName: "West Side Plumbing Co.",
    contactName: "Erik Nolan",
    phone: "646-555-0111",
    email: "service@wspco.com",
    website: "https://example.com/plumbing",
    tier: "standard",
  },
  {
    id: "v-003",
    category: "Electrical",
    businessName: "Brightline Electric NYC",
    contactName: "Michelle Tran",
    phone: "917-555-0173",
    email: "dispatch@brightline.nyc",
    website: "https://example.com/electrical",
    tier: "standard",
  },
  {
    id: "v-004",
    category: "HVAC",
    businessName: "Hudson Air Systems",
    contactName: "Paul Donovan",
    phone: "212-555-0142",
    email: "service@hudsonair.com",
    website: "https://example.com/hvac",
    tier: "standard",
  },
  {
    id: "v-005",
    category: "Flooring",
    businessName: "Fifth Ave Floor Works",
    contactName: "Natalie Brooks",
    phone: "646-555-0183",
    email: "hello@floorworks.com",
    website: "https://example.com/flooring",
    tier: "standard",
  },
  {
    id: "v-006",
    category: "Elevator",
    businessName: "Metro Lift Services",
    contactName: "Gerard Pike",
    phone: "212-555-0158",
    email: "support@metrolift.com",
    website: "https://example.com/elevator",
    tier: "standard",
  },
  {
    id: "v-007",
    category: "Landscaping",
    businessName: "Emerald Exterior Care",
    contactName: "Ana Rosales",
    phone: "917-555-0184",
    email: "team@emeraldexterior.com",
    website: "https://example.com/landscaping",
    tier: "standard",
  },
  {
    id: "v-008",
    category: "Roofing",
    businessName: "Skyline Roofing Group",
    contactName: "Joseph Kim",
    phone: "212-555-0166",
    email: "quotes@skylineroofing.com",
    website: "https://example.com/roofing",
    tier: "standard",
  },
  {
    id: "v-009",
    category: "Masonry",
    businessName: "CityStone Restoration",
    contactName: "Declan Hennessy",
    phone: "646-555-0139",
    email: "project@citystone.io",
    website: "https://example.com/masonry",
    tier: "standard",
  },
  {
    id: "v-010",
    category: "Security",
    businessName: "Summit Access Control",
    contactName: "Rachel Cohen",
    phone: "917-555-0190",
    email: "info@summitaccess.com",
    website: "https://example.com/security",
    tier: "featured",
    blurb: "Building entry, camera, and access-control systems for co-ops.",
  },
];

export const sampleFrontSection: FrontSectionData = {
  memorialNames: [
    "Johnny Akers",
    "Patrick Breen",
    "Patrick Connell",
    "Michael Coyne",
    "Sheamus Cullen",
    "James Dermody",
    "Michael Donoghue",
    "John Flanagan",
    "Matthew Geoghegan",
    "Patrick Geoghegan",
  ],
  memberOfYearCurrent: {
    year: 2023,
    name: "Killian Moore",
  },
  memberOfYearPast: [
    { year: 2022, name: "John Keegan" },
    { year: 2021, name: "Michael McCreesh" },
    { year: 2020, name: "Louis Corbett" },
    { year: 2019, name: "Anthony Fallon" },
    { year: 2018, name: "Tim Lane" },
    { year: 2017, name: "John Hoy" },
  ],
  grandMarshalCurrent: {
    year: 2024,
    name: "Brendan Keane",
  },
  grandMarshalPast: [
    { year: 2023, name: "Patrick Brady" },
    { year: 2022, name: "Barry Riordan" },
    { year: 2021, name: "Declan Moran" },
    { year: 2020, name: "Paul Motherway" },
    { year: 2019, name: "David Nikaj" },
    { year: 2018, name: "Lloyd Fehily" },
  ],
  officers: [
    { role: "President", name: "Michael McCreesh" },
    { role: "Vice-President", name: "Anthony Fallon" },
    { role: "Treasurer", name: "John Scanlon" },
    { role: "Registrar", name: "Patrick Reidy" },
    { role: "Secretary", name: "Shane O'Mahoney" },
  ],
  trustees: [
    "Mr. Patrick Macken",
    "Mr. Barry Riordan",
    "Mr. Michael Gubbins",
    "Mr. Robert Knox",
    "Mr. Declan Moran",
  ],
};
