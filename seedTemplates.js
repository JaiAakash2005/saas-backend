require("dotenv").config();
const mongoose = require("mongoose");
const Template = require("./models/Template");

const sampleTemplates = [
  [
    "Minimal Portfolio",
    "Portfolio",
    "A personal portfolio for presenting skills, projects, experience, and contact information.",
    "photo-1506794778202-cad84cf45f1d",
    ["Personal Brand", "Projects"],
  ],
  [
    "Creative Agency",
    "Business",
    "A creative agency website for showcasing services, client work, team members, and project enquiries.",
    "photo-1523726491678-bf852e717f6a",
    ["Agency", "Case Studies"],
  ],
  [
    "Modern SaaS Landing",
    "Landing Page",
    "A conversion-focused landing page for software products, subscriptions, and early-access campaigns.",
    "photo-1461749280684-dccba630e2f6",
    ["SaaS", "Startup"],
  ],
  [
    "Online Storefront",
    "E-commerce",
    "A modern storefront for browsing product collections, highlighting products, and guiding shoppers toward purchase.",
    "photo-1556742049-0cfed4f6a45d",
    ["Products", "Shopping"],
  ],
  [
    "Restaurant Website",
    "Food",
    "A restaurant website featuring menu highlights, opening information, location details, and reservation calls to action.",
    "photo-1517248135467-4c7edcad34c4",
    ["Restaurant", "Menu"],
  ],
  [
    "Travel Explorer",
    "Travel",
    "A destination discovery website featuring travel ideas, destination photography, packages, and itinerary highlights.",
    "photo-1464822759023-fed622ff2c3b",
    ["Travel", "Adventure"],
  ],
  [
    "Fitness Studio",
    "Fitness",
    "A fitness website for promoting classes, trainers, memberships, and healthy lifestyle services.",
    "photo-1534438327276-14e5300c3a48",
    ["Gym", "Classes"],
  ],
  [
    "Online Learning Hub",
    "Education",
    "An education platform for introducing courses, instructors, learning paths, and student outcomes.",
    "photo-1523240795612-9a054b0db644",
    ["Learning", "Courses"],
  ],
  [
    "Photography Portfolio",
    "Portfolio",
    "An image-first portfolio for photographers to present galleries, featured shoots, specialties, and booking information.",
    "photo-1452587925148-ce544e77e70d",
    ["Photography", "Gallery"],
  ],
  [
    "Real Estate Listings",
    "Real Estate",
    "A property discovery website for featuring homes, property details, neighbourhood information, and enquiry options.",
    "photo-1600596542815-ffad4c1539a9",
    ["Property", "Homes"],
  ],
  [
    "Startup Launch",
    "Landing Page",
    "A startup launch page for explaining a product, communicating its value, collecting leads, and building early interest.",
    "photo-1559136555-9303baea8ebd",
    ["Startup", "Launch"],
  ],
  [
    "Personal Blog",
    "Blog",
    "An editorial website for publishing articles, organising topics, introducing an author, and highlighting recent posts.",
    "photo-1499951360447-b19be8fe80f5",
    ["Articles", "Writing"],
  ],
  [
    "Finance Dashboard",
    "Dashboard",
    "A financial overview interface for account summaries, spending categories, transactions, and performance indicators.",
    "photo-1551288049-bebda4e38f71",
    ["Analytics", "Finance"],
  ],
  [
    "Healthcare Clinic",
    "Healthcare",
    "A clinic website for introducing practitioners, listing services, explaining care options, and sharing contact information.",
    "photo-1519494026892-80bbd2d6fd0d",
    ["Healthcare", "Appointments"],
  ],
  [
    "Event Conference",
    "Events",
    "An event page featuring conference themes, speakers, schedules, venue information, and registration details.",
    "photo-1540575467063-178a50c2df87",
    ["Conference", "Speakers"],
  ],
  [
    "Mobile App Showcase",
    "Landing Page",
    "A mobile application showcase featuring product benefits, interface previews, user reviews, and download links.",
    "photo-1512941937669-90a1b58e7e9c",
    ["Mobile App", "Product"],
  ],
  [
    "Interior Design Studio",
    "Business",
    "An interior design website for displaying projects, describing services, sharing design approaches, and receiving enquiries.",
    "photo-1600210492486-724fe5c67fb0",
    ["Interior", "Design"],
  ],
  [
    "Fashion Boutique",
    "E-commerce",
    "A fashion storefront for seasonal collections, product photography, style categories, and featured products.",
    "photo-1483985988355-763728e1935b",
    ["Fashion", "Retail"],
  ],
  [
    "Pet Care Services",
    "Services",
    "A pet care website for explaining grooming, boarding, walking, and appointment options.",
    "photo-1450778869180-41d0601e046e",
    ["Pets", "Care"],
  ],
  [
    "Legal Consultancy",
    "Business",
    "A professional legal consultancy website outlining practice areas, team credentials, and consultation options.",
    "photo-1589829075413-56de8ae18c73",
    ["Legal", "Consulting"],
  ],
  [
    "Music Artist",
    "Portfolio",
    "An artist profile for music releases, biography, tour dates, media, and streaming platform links.",
    "photo-1516280440614-37939bbacd81",
    ["Music", "Artist"],
  ],
  [
    "Beauty Salon",
    "Services",
    "A beauty salon website promoting treatments, service packages, staff, and booking options.",
    "photo-1560066984-138dadb4c035",
    ["Beauty", "Salon"],
  ],
  [
    "Architecture Studio",
    "Portfolio",
    "An architecture portfolio presenting built projects, design principles, studio expertise, and project enquiries.",
    "photo-1487958449943-2429e8be8625",
    ["Architecture", "Projects"],
  ],
  [
    "Nonprofit Campaign",
    "Nonprofit",
    "A mission-driven campaign website communicating impact, presenting initiatives, sharing stories, and inviting supporters.",
    "photo-1531206715517-5c0ba140b2b8",
    ["Impact", "Community"],
  ],
  [
    "Online Course Platform",
    "Education",
    "A course catalogue for organising subjects, highlighting instructors, explaining outcomes, and guiding learners to enrol.",
    "photo-1516321318423-f06f85e504b3",
    ["Courses", "Enrolment"],
  ],
  [
    "Product Waitlist",
    "Landing Page",
    "A focused waitlist page explaining an upcoming product, highlighting benefits, and collecting early-access interest.",
    "photo-1519389950473-47ba0277781c",
    ["Waitlist", "Early Access"],
  ],
  [
    "Coworking Space",
    "Business",
    "A workspace website featuring facilities, membership plans, meeting rooms, community benefits, and tour enquiries.",
    "photo-1497366754035-f200968a6e72",
    ["Workspace", "Office"],
  ],
  [
    "Wedding Planner",
    "Events",
    "An elegant event-planning website showcasing celebrations, planning services, galleries, testimonials, and consultations.",
    "photo-1519741497674-611481863552",
    ["Wedding", "Planning"],
  ],
  [
    "Automotive Showcase",
    "Business",
    "A vehicle showcase featuring models, specifications, image galleries, key benefits, and test-drive enquiries.",
    "photo-1492144534655-ae79c964c9d7",
    ["Automotive", "Vehicles"],
  ],
  [
    "Podcast Studio",
    "Media",
    "A podcast website presenting episodes, host profiles, show topics, listening platforms, and subscription links.",
    "photo-1590602847861-f357a9332bbc",
    ["Podcast", "Audio"],
  ],
  [
    "Gardening Journal",
    "Blog",
    "A nature-inspired editorial site for growing guides, seasonal advice, plant profiles, and garden project stories.",
    "photo-1416879595882-3373a0480b5b",
    ["Gardening", "Plants"],
  ],
  [
    "Cybersecurity Services",
    "Technology",
    "A technology services website describing security offerings, assessment processes, trust signals, and consultations.",
    "photo-1550751827-4bd374c3f58b",
    ["Security", "Technology"],
  ],
  [
    "HR Recruitment",
    "Business",
    "A recruitment website explaining hiring support, specialist roles, employer services, and candidate enquiries.",
    "photo-1521737711867-e3b97375f902",
    ["Recruitment", "Hiring"],
  ],
  [
    "Personal Finance Blog",
    "Blog",
    "An educational finance blog for publishing money guides, budgeting advice, saving tips, and explainers.",
    "photo-1554224155-6726b3ff858f",
    ["Finance", "Budgeting"],
  ],
  [
    "Digital Product Store",
    "E-commerce",
    "A digital goods storefront organising downloadable resources and explaining product benefits to potential customers.",
    "photo-1460925895917-afdab827c52f",
    ["Digital Goods", "Downloads"],
  ],
  [
    "Nonprofit Volunteer Hub",
    "Nonprofit",
    "A volunteer recruitment page explaining community programmes, listing opportunities, sharing impact, and inviting people to help.",
    "photo-1559027615-cd4628902d4a",
    ["Volunteers", "Community"],
  ],
];

function createDetails(name, category, description, tags) {
  const commonFeatures = [
    "Clear introduction and prominent headline",
    "Organised content sections with readable hierarchy",
    "Relevant images and visual highlights",
    "Responsive layout for desktop, tablet, and mobile",
    "Clear call-to-action and contact section",
  ];

  const categoryPages = {
    Portfolio: ["Home", "About", "Projects", "Experience", "Contact"],
    Business: ["Home", "About", "Services", "Projects or Team", "Contact"],
    "Landing Page": ["Home", "Features", "Benefits", "Testimonials", "FAQ"],
    "E-commerce": [
      "Home",
      "Collections",
      "Product Details",
      "Cart Concept",
      "Support",
    ],
    Blog: ["Home", "Article Listing", "Article Details", "Author", "Contact"],
    Education: [
      "Home",
      "Course Catalogue",
      "Course Details",
      "Instructors",
      "Contact",
    ],
    Events: ["Home", "Event Details", "Schedule", "Speakers", "Registration"],
    Nonprofit: [
      "Home",
      "Mission",
      "Programmes",
      "Impact Stories",
      "Get Involved",
    ],
    Dashboard: ["Overview", "Analytics", "Transactions", "Reports", "Settings"],
    Services: ["Home", "Services", "Pricing", "About", "Contact"],
    Food: ["Home", "Menu", "About", "Reservations", "Location"],
    Travel: ["Home", "Destinations", "Packages", "Itineraries", "Contact"],
    Fitness: ["Home", "Classes", "Trainers", "Membership", "Contact"],
    "Real Estate": [
      "Home",
      "Property Listings",
      "Property Details",
      "Agents",
      "Contact",
    ],
    Healthcare: [
      "Home",
      "Medical Services",
      "Doctors",
      "Appointments",
      "Contact",
    ],
    Media: ["Home", "Episodes", "About the Host", "Listen", "Contact"],
    Technology: ["Home", "Solutions", "Services", "Security", "Contact"],
  };

  const categoryFeatures = {
    Portfolio: [
      "Featured project gallery",
      "Skills and experience section",
      "Personal introduction",
    ],
    Business: [
      "Service overview cards",
      "Company and team introduction",
      "Client trust and testimonials",
    ],
    "Landing Page": [
      "Hero section with primary call to action",
      "Benefits and feature highlights",
      "Testimonials and FAQ section",
    ],
    "E-commerce": [
      "Featured products and collections",
      "Product discovery sections",
      "Promotional content areas",
    ],
    Blog: [
      "Featured article area",
      "Topic and tag organisation",
      "Readable article previews",
    ],
    Education: [
      "Course and learning path cards",
      "Instructor introductions",
      "Learning outcome highlights",
    ],
    Events: [
      "Event summary and date information",
      "Schedule and speaker highlights",
      "Venue and registration information",
    ],
    Nonprofit: [
      "Mission and impact statement",
      "Community programme highlights",
      "Volunteer call to action",
    ],
    Dashboard: [
      "Summary metric cards",
      "Data visualisation placeholders",
      "Transaction and report sections",
    ],
    Services: [
      "Service and package cards",
      "Staff or provider introduction",
      "Appointment or enquiry actions",
    ],
    Food: [
      "Menu highlights",
      "Restaurant information",
      "Reservation and location details",
    ],
    Travel: [
      "Destination highlights",
      "Trip and package cards",
      "Itinerary information",
    ],
    Fitness: [
      "Class highlights",
      "Trainer introduction",
      "Membership information",
    ],
    "Real Estate": [
      "Featured property cards",
      "Property information sections",
      "Agent enquiry actions",
    ],
    Healthcare: [
      "Medical service overview",
      "Practitioner introduction",
      "Appointment information",
    ],
    Media: ["Episode listing", "Host profile", "Listening platform links"],
    Technology: [
      "Service overview",
      "Security capability highlights",
      "Consultation call to action",
    ],
  };

  const categoryUseCases = {
    Portfolio: [
      "Freelancers and independent professionals",
      "Students and job seekers",
      "Creators showcasing their work",
    ],
    Business: [
      "Small and medium businesses",
      "Consultants and agencies",
      "Professional service providers",
    ],
    "Landing Page": [
      "Product launches",
      "SaaS and app marketing",
      "Lead generation campaigns",
    ],
    "E-commerce": [
      "Online retailers",
      "Independent brands",
      "Digital product sellers",
    ],
    Blog: ["Writers and creators", "Educational publishers", "Company blogs"],
    Education: [
      "Tutors and educators",
      "Online course providers",
      "Training organisations",
    ],
    Events: ["Conference organisers", "Event planners", "Community events"],
    Nonprofit: [
      "Charities and foundations",
      "Community groups",
      "Volunteer organisations",
    ],
  };

  return {
    name,
    category,
    description,
    longDescription:
      `${name} is a thoughtfully structured ${category.toLowerCase()} template designed as a starting point for a polished online presence. ` +
      `${description} The page layout helps visitors discover the most important information, understand the offering, and find a relevant next step. ` +
      `Customise the text, colours, typography, imagery, and calls to action to suit your brand and audience. ` +
      `Use this template as a prototype or as a foundation for a fully implemented website after adapting and testing the required functionality.`,
    thumbnail_url: `https://images.unsplash.com/${createDetails.image || ""}`,
    features: [
      ...(categoryFeatures[category] || commonFeatures),
      ...commonFeatures,
    ].filter((feature, index, array) => array.indexOf(feature) === index),
    pagesIncluded: categoryPages[category] || [
      "Home",
      "Overview",
      "Features",
      "Gallery",
      "Contact",
    ],
    useCases: categoryUseCases[category] || [
      `Individuals and teams working in ${category.toLowerCase()}`,
      "Businesses looking for a website starting point",
      "Projects requiring a responsive web presence",
    ],
    techStack: ["React", "JavaScript", "CSS", "Responsive Design"],
    tags: [...new Set([category, ...tags, "Responsive", "Customizable"])],
    previewImages: [],
    difficulty: "Beginner friendly",
  };
}

async function seedTemplates() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Add MONGODB_URI or MONGO_URI to backend/.env");
  }

  await mongoose.connect(mongoUri);

  const operations = sampleTemplates.map(
    ([name, category, description, imageId, tags]) => {
      const data = createDetails(name, category, description, tags);
      const imageUrl = `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1200&q=85`;

      data.thumbnail_url = imageUrl;
      data.previewImages = [
        `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1600&q=90`,
      ];

      return {
        updateOne: {
          filter: { name },
          update: { $set: data },
          upsert: true,
        },
      };
    },
  );

  const result = await Template.bulkWrite(operations);
  const total = await Template.countDocuments();

  console.log("Template seed operation completed.");
  console.log(`Templates processed: ${sampleTemplates.length}`);
  console.log(`Inserted: ${result.upsertedCount}`);
  console.log(`Updated: ${result.modifiedCount}`);
  console.log(`Total documents in collection: ${total}`);
  console.log("Existing documents with other names were preserved.");

  await mongoose.disconnect();
}

seedTemplates().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
