// Initial website content, imported once into an empty database by `prisma db seed`.
// After that, everything is edited from the admin panel.

type Price = { amount: number; period?: "month" | "project" | "session" | "" };
type SeedEntry = { slug: string; data: Record<string, unknown> };

const price = (amount: number, period: Price["period"]): Price => ({ amount, period });

export const services: (SeedEntry & {
  children?: SeedEntry[];
})[] = [
  {
    slug: "social-media-marketing",
    data: {
      title: "Social Media Marketing",
      shortTitle: "Social Media Marketing",
      icon: "megaphone",
      excerpt: "Build your brand and engage your audience across every social platform.",
      startingPrice: price(15000, "month"),
      heroTitle: "Social Media Marketing",
      description:
        "Build your brand, engage your audience and drive real results with data-driven social media strategies.",
      image: "/images/social-media.jpg",
      features: [
        "Content Strategy & Planning",
        "Creative Design & Video Content",
        "Community Management",
        "Paid Social Campaigns",
        "Performance Tracking & Reporting",
      ],
      whyItWorks: "The right message, to the right audience, at the right time.",
    },
    children: [
      {
        slug: "facebook-page-management",
        data: {
          title: "Facebook Page Management",
          excerpt: "Daily posting, replies and page growth handled end to end.",
          description:
            "We plan, design and publish content for your Facebook page, reply to comments and messages, and grow an audience that actually buys.",
          startingPrice: price(8000, "month"),
          deliverables: [
            "20 designed posts per month",
            "Content calendar & captions",
            "Comment and inbox moderation",
            "Monthly performance report",
          ],
          turnaround: "Starts within 3 days",
        },
      },
      {
        slug: "instagram-growth",
        data: {
          title: "Instagram Growth",
          excerpt: "Reels, stories and a grid that turns followers into customers.",
          description:
            "A consistent Instagram presence with Reels, Stories and a branded grid, plus hashtag and engagement strategy to reach the right people.",
          startingPrice: price(10000, "month"),
          deliverables: ["8 Reels per month", "Story templates", "Hashtag & audience research", "Profile optimisation"],
          turnaround: "Starts within 5 days",
        },
      },
      {
        slug: "content-creation",
        data: {
          title: "Content Creation",
          excerpt: "Scroll-stopping graphics, videos and copy for every platform.",
          description:
            "Our creative team produces on-brand graphics, short-form videos and copy that you can use across all your social channels.",
          startingPrice: price(6000, "month"),
          deliverables: ["Graphic design", "Short-form video editing", "Copywriting", "Brand style guide"],
          turnaround: "First drafts in 4 days",
        },
      },
      {
        slug: "influencer-marketing",
        data: {
          title: "Influencer Marketing",
          excerpt: "Partner with creators your audience already trusts.",
          description:
            "We find, vet and manage influencers that fit your brand, then track every campaign so you know exactly what it delivered.",
          startingPrice: price(20000, "project"),
          deliverables: ["Influencer shortlisting", "Campaign brief & negotiation", "Content approval", "Results report"],
          turnaround: "Campaign live in 2 weeks",
        },
      },
    ],
  },
  {
    slug: "paid-advertising",
    data: {
      title: "Paid Advertising",
      shortTitle: "Paid Advertising",
      icon: "target",
      excerpt: "High-ROI campaigns on Google, Meta and TikTok that turn ad spend into revenue.",
      startingPrice: price(12000, "month"),
      heroTitle: "Paid Advertising",
      description:
        "Every taka counts. We plan, launch and optimise paid campaigns that bring in customers — not just clicks.",
      image: "/images/dashboard.jpg",
      features: [
        "Google Search & Shopping Ads",
        "Meta (Facebook & Instagram) Ads",
        "TikTok & YouTube Ads",
        "Conversion Tracking Setup",
        "A/B Testing & ROAS Optimisation",
      ],
      whyItWorks: "Data decides the budget, so every campaign gets smarter over time.",
    },
    children: [
      {
        slug: "facebook-instagram-ads",
        data: {
          title: "Facebook & Instagram Ads",
          excerpt: "Meta campaigns built to bring sales, not just likes.",
          description:
            "Full-funnel Meta campaigns with audience research, creative testing and pixel tracking so every taka is accountable.",
          startingPrice: price(10000, "month"),
          deliverables: ["Campaign strategy", "Pixel & conversion setup", "Ad creative testing", "Weekly optimisation"],
          turnaround: "Ads live in 3 days",
        },
      },
      {
        slug: "google-ads",
        data: {
          title: "Google Ads",
          excerpt: "Show up the moment customers search for what you sell.",
          description:
            "Search, Shopping and Performance Max campaigns structured around buyer intent, with keyword and bid management every week.",
          startingPrice: price(12000, "month"),
          deliverables: ["Keyword research", "Search & Shopping campaigns", "Conversion tracking", "Monthly ROAS report"],
          turnaround: "Ads live in 4 days",
        },
      },
      {
        slug: "tiktok-ads",
        data: {
          title: "TikTok Ads",
          excerpt: "Native-feeling video ads for a younger, high-intent audience.",
          description:
            "TikTok campaigns with creator-style video ads, Spark Ads and audience targeting designed for fast, affordable reach.",
          startingPrice: price(10000, "month"),
          deliverables: ["Video ad concepts", "Spark Ads setup", "Audience targeting", "Performance tracking"],
          turnaround: "Ads live in 5 days",
        },
      },
    ],
  },
  {
    slug: "seo-content-marketing",
    data: {
      title: "SEO & Content Marketing",
      shortTitle: "SEO & Content Marketing",
      icon: "search",
      excerpt: "Rank higher, attract organic traffic and earn trust with content that converts.",
      startingPrice: price(18000, "month"),
      heroTitle: "SEO & Content Marketing",
      description:
        "Get found by the customers already searching for you, with technical SEO and content built to rank and convert.",
      image: "/images/seo.jpg",
      features: [
        "Technical SEO Audit",
        "Keyword & Competitor Research",
        "On-page Optimisation",
        "Blog & Content Writing",
        "Link Building & Local SEO",
      ],
      whyItWorks: "Organic traffic compounds — it keeps paying off long after the work is done.",
    },
    children: [
      {
        slug: "technical-seo-audit",
        data: {
          title: "Technical SEO Audit",
          excerpt: "Find and fix what is stopping Google from ranking you.",
          description:
            "A full technical review of your site — speed, indexing, structure and errors — with a prioritised fix list.",
          startingPrice: price(15000, "project"),
          deliverables: [
            "Crawl & indexing review",
            "Core Web Vitals check",
            "Site structure analysis",
            "Prioritised fix list",
          ],
          turnaround: "Report in 7 days",
        },
      },
      {
        slug: "local-seo",
        data: {
          title: "Local SEO",
          excerpt: "Rank in Google Maps when nearby customers search.",
          description:
            "Google Business Profile optimisation, local citations and review strategy so you appear in the local map pack.",
          startingPrice: price(8000, "month"),
          deliverables: ["Google Business Profile setup", "Local citations", "Review strategy", "Local rank tracking"],
          turnaround: "Starts within 3 days",
        },
      },
      {
        slug: "blog-content-writing",
        data: {
          title: "Blog & Content Writing",
          excerpt: "Search-optimised articles that build trust and traffic.",
          description:
            "Researched, SEO-optimised articles written for your customers, published on a schedule that keeps traffic growing.",
          startingPrice: price(7000, "month"),
          deliverables: ["Keyword-led topic plan", "4 articles per month", "On-page optimisation", "Internal linking"],
          turnaround: "First article in 5 days",
        },
      },
    ],
  },
  {
    slug: "website-ecommerce",
    data: {
      title: "Website & E-commerce",
      shortTitle: "Website & E-commerce",
      icon: "monitor-smartphone",
      excerpt: "Fast, modern websites and online stores designed to turn visitors into customers.",
      startingPrice: price(35000, "project"),
      heroTitle: "Website & E-commerce",
      description:
        "From landing pages to full online stores, we build fast, secure and mobile-first websites that sell.",
      image: "/images/hero-laptop.jpg",
      features: [
        "Custom Website Design",
        "E-commerce Store Development",
        "Payment Gateway Integration",
        "Speed & Performance Optimisation",
        "Maintenance & Support",
      ],
      whyItWorks: "A fast, clear website is your best salesperson — working 24/7.",
    },
    children: [
      {
        slug: "business-website",
        data: {
          title: "Business Website",
          excerpt: "A fast, professional website that builds trust instantly.",
          description:
            "A custom-designed, mobile-first business website with clear messaging, contact forms and basic SEO built in.",
          startingPrice: price(25000, "project"),
          deliverables: ["Up to 6 custom pages", "Mobile-first design", "Contact forms", "Basic SEO setup"],
          turnaround: "Delivered in 2–3 weeks",
        },
      },
      {
        slug: "ecommerce-store",
        data: {
          title: "E-commerce Store",
          excerpt: "An online store with payments, inventory and fast checkout.",
          description:
            "A complete online store with product management, bKash/card payments, delivery integration and a checkout built to convert.",
          startingPrice: price(45000, "project"),
          deliverables: [
            "Product & inventory management",
            "Payment gateway integration",
            "Courier integration",
            "Order dashboard",
          ],
          turnaround: "Delivered in 4–6 weeks",
        },
      },
      {
        slug: "landing-page",
        data: {
          title: "Landing Page",
          excerpt: "A single high-converting page for your campaign or product.",
          description:
            "A focused landing page designed around one goal — leads or sales — with fast loading and tracking ready for ads.",
          startingPrice: price(12000, "project"),
          deliverables: ["Conversion-focused design", "Copywriting support", "Pixel & analytics setup", "A/B test ready"],
          turnaround: "Delivered in 1 week",
        },
      },
      {
        slug: "website-maintenance",
        data: {
          title: "Website Maintenance",
          excerpt: "Updates, backups and security so your site never breaks.",
          description:
            "Ongoing care for your website — updates, backups, uptime monitoring and small content changes whenever you need them.",
          startingPrice: price(5000, "month"),
          deliverables: ["Weekly backups", "Security & plugin updates", "Uptime monitoring", "Small content edits"],
          turnaround: "Starts immediately",
        },
      },
    ],
  },
  {
    slug: "business-growth-consulting",
    data: {
      title: "Business Growth Consulting",
      shortTitle: "Business Growth Consulting",
      icon: "chart-column",
      excerpt: "Clear strategy, sharper positioning and a roadmap for sustainable growth.",
      startingPrice: price(10000, "session"),
      heroTitle: "Business Growth Consulting",
      description:
        "We look at your whole funnel — brand, offer, marketing and sales — and build a practical plan to grow.",
      image: "/images/team-meeting.jpg",
      features: [
        "Market & Competitor Analysis",
        "Brand Positioning",
        "Go-to-Market Strategy",
        "Sales Funnel Optimisation",
        "KPI & Growth Roadmap",
      ],
      whyItWorks: "Strategy first, tactics second — so every effort points the same way.",
    },
  },
  {
    slug: "tech-support-solutions",
    data: {
      title: "Tech Support & Solutions",
      shortTitle: "Tech Support & Solutions",
      icon: "settings",
      excerpt: "Reliable IT support, automation and cloud solutions that keep your business running.",
      startingPrice: price(8000, "month"),
      heroTitle: "Tech Support & Solutions",
      description: "Keep your business running smoothly with reliable IT support, cloud setup and smart automation.",
      image: "/images/office.jpg",
      features: [
        "IT Infrastructure Setup",
        "Cloud & Email Solutions",
        "Business Process Automation",
        "Security & Backups",
        "Ongoing Technical Support",
      ],
      whyItWorks: "Less downtime and fewer manual tasks means more time to grow.",
    },
  },
];

export const caseStudies: SeedEntry[] = [
  {
    slug: "ecommerce-brand-growth",
    data: {
      title: "E-commerce Brand Growth",
      client: "Fashion retailer",
      category: "E-commerce",
      image: "/images/case-ecommerce.jpg",
      metric: { value: "+230%", label: "Sales Growth" },
      summary: "Scaling an online fashion store with full-funnel paid social and conversion-focused design.",
      challenge:
        "The brand had strong products but inconsistent sales, high ad costs and a store that lost most visitors at checkout.",
      solution:
        "We rebuilt the ad funnel on Meta and Google, launched creator-style video creatives and simplified the checkout flow.",
      results: [
        { value: "+230%", label: "Sales Growth" },
        { value: "4.1x", label: "Return on Ad Spend" },
        { value: "-38%", label: "Cost per Purchase" },
      ],
      services: ["Paid Advertising", "Social Media Marketing", "Website & E-commerce"],
    },
  },
  {
    slug: "lead-gen-campaign-saas",
    data: {
      title: "Lead Gen Campaign for SaaS",
      client: "B2B software company",
      category: "Lead Generation",
      image: "/images/case-leadgen.jpg",
      metric: { value: "+180%", label: "Qualified Leads" },
      summary: "Turning a SaaS free trial into a predictable pipeline of qualified B2B leads.",
      challenge: "Lots of sign-ups, but very few became paying customers, and the sales team was wasting time.",
      solution:
        "We built LinkedIn and Google lead campaigns with lead scoring, new landing pages and an automated email nurture.",
      results: [
        { value: "+180%", label: "Qualified Leads" },
        { value: "-45%", label: "Cost per Lead" },
        { value: "2.3x", label: "Demo Bookings" },
      ],
      services: ["Paid Advertising", "Business Growth Consulting"],
    },
  },
  {
    slug: "brand-awareness-fmcg",
    data: {
      title: "Brand Awareness for FMCG Brand",
      client: "FMCG brand",
      category: "Brand Awareness",
      image: "/images/case-brand.jpg",
      metric: { value: "+250%", label: "Reach Growth" },
      summary: "Launching a new FMCG product nationwide with social-first storytelling.",
      challenge: "A new product in a crowded category with almost no brand recognition.",
      solution: "We ran an influencer and video-led launch campaign with community management across platforms.",
      results: [
        { value: "+250%", label: "Reach Growth" },
        { value: "12M+", label: "Video Views" },
        { value: "+90K", label: "New Followers" },
      ],
      services: ["Social Media Marketing", "Paid Advertising"],
    },
  },
  {
    slug: "real-estate-website-seo",
    data: {
      title: "Website & SEO for Real Estate",
      client: "Real estate developer",
      category: "Website & SEO",
      image: "/images/seo.jpg",
      metric: { value: "+320%", label: "Organic Traffic" },
      summary: "A fast new website and SEO strategy that made the brand the top search result in its area.",
      challenge: "An outdated, slow website that did not appear on Google for any important search terms.",
      solution: "We designed a new mobile-first website, fixed technical SEO and published location-based content.",
      results: [
        { value: "+320%", label: "Organic Traffic" },
        { value: "Top 3", label: "Google Rankings" },
        { value: "+140%", label: "Enquiries" },
      ],
      services: ["Website & E-commerce", "SEO & Content Marketing"],
    },
  },
];

export const posts: SeedEntry[] = [
  {
    slug: "facebook-ads-strategy-2026",
    data: {
      title: "The Facebook Ads Strategy That Still Works in 2026",
      excerpt: "Algorithms change, fundamentals don't. Here's the simple funnel we use to scale ad accounts profitably.",
      category: "Paid Advertising",
      image: "/images/dashboard.jpg",
      date: "2026-10-12",
      readTime: "6 min read",
      content: [
        "Every year someone announces that Facebook ads are dead, and every year brands that understand the fundamentals keep scaling profitably.",
        "The strategy is simple: broad targeting, strong creative and a clear offer. Let the algorithm find buyers, and spend your energy on the message.",
        "Start with three creative angles, test them against each other, and move budget to the winner every week. Track purchases, not clicks.",
      ].join("\n\n"),
    },
  },
  {
    slug: "local-seo-guide-bangladesh",
    data: {
      title: "A Practical Local SEO Guide for Bangladeshi Businesses",
      excerpt: "How to show up when customers near you search on Google — step by step, no jargon.",
      category: "SEO",
      image: "/images/seo.jpg",
      date: "2026-09-28",
      readTime: "8 min read",
      content: [
        "Most local customers search on their phone before they visit or call. If you don't show up, your competitor does.",
        "Start by claiming and completing your Google Business Profile. Add real photos, opening hours and ask happy customers for reviews.",
        "Then make sure your website mentions your location clearly and loads fast on mobile.",
      ].join("\n\n"),
    },
  },
  {
    slug: "website-speed-sales",
    data: {
      title: "Why Your Website Speed Is Costing You Sales",
      excerpt: "Every extra second of loading time loses customers. Here's how to fix it.",
      category: "Web Development",
      image: "/images/hero-laptop.jpg",
      date: "2026-09-10",
      readTime: "5 min read",
      content: [
        "Visitors decide within a few seconds whether to stay. A slow website loses them before they see your offer.",
        "Compress images, remove unused plugins and use a good hosting provider. These three steps fix most speed problems.",
        "Measure before and after with Google PageSpeed Insights so you know what actually improved.",
      ].join("\n\n"),
    },
  },
];

export const testimonials: SeedEntry[] = [
  {
    slug: "rafiq-ahmed",
    data: {
      name: "Rafiq Ahmed",
      role: "Founder & CEO",
      company: "NovaMart",
      quote:
        "Digiline Tech completely changed how we sell online. Our ads finally make money, our store loads fast and sales have more than doubled in six months.",
      rating: 5,
      result: { value: "+230%", label: "Online sales" },
      avatar: "",
    },
  },
  {
    slug: "nusrat-jahan",
    data: {
      name: "Nusrat Jahan",
      role: "Marketing Director",
      company: "GreenLeaf",
      quote:
        "They feel like part of our own team. Clear reporting every week, smart ideas every month and a social media presence our customers actually love.",
      rating: 5,
      result: { value: "3.5x", label: "Engagement" },
      avatar: "",
    },
  },
  {
    slug: "tanvir-hasan",
    data: {
      name: "Tanvir Hasan",
      role: "Head of Growth",
      company: "PayFlow",
      quote:
        "Our cost per lead dropped by half while lead quality went up. The team understands both the data and the creative side, which is rare.",
      rating: 5,
      result: { value: "-52%", label: "Cost per lead" },
      avatar: "",
    },
  },
  {
    slug: "sarah-williams",
    data: {
      name: "Sarah Williams",
      role: "Operations Manager",
      company: "TripNova",
      quote:
        "From our new website to IT support, everything just works now. Fast replies, honest advice and results we can measure. Highly recommended.",
      rating: 5,
      result: { value: "+180%", label: "Bookings" },
      avatar: "",
    },
  },
  {
    slug: "imran-chowdhury",
    data: {
      name: "Imran Chowdhury",
      role: "Managing Director",
      company: "Skyline Realty",
      quote:
        "We now rank on the first page of Google for our key searches. The SEO work brought a steady flow of serious buyers to our door.",
      rating: 5,
      result: { value: "#1", label: "Google ranking" },
      avatar: "",
    },
  },
];

const brand = (name: string, icon: string, wordmark: string): SeedEntry => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  data: { name, icon, wordmark, logo: "" },
});

export const brands: SeedEntry[] = [
  brand("NovaMart", "shopping-bag", "bold"),
  brand("GreenLeaf", "leaf", "serif"),
  brand("MediLink", "heart-pulse", "wide"),
  brand("UrbanNest", "house", "bold"),
  brand("PayFlow", "wallet", "mono"),
  brand("EduSphere", "graduation-cap", "serif"),
  brand("Skyline Realty", "building-2", "wide"),
  brand("TechNest", "cpu", "mono"),
  brand("Bengal Bites", "utensils-crossed", "bold"),
  brand("TripNova", "plane", "serif"),
];

export const values: SeedEntry[] = [
  { slug: "integrity", data: { title: "Integrity", description: "We do what's right", icon: "heart" } },
  { slug: "innovation", data: { title: "Innovation", description: "We stay ahead", icon: "lightbulb" } },
  { slug: "collaboration", data: { title: "Collaboration", description: "We grow together", icon: "users" } },
  { slug: "impact", data: { title: "Impact", description: "We create lasting value", icon: "zap" } },
];
