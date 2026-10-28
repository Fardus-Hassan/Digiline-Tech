// Default content for every editable section of the site. The admin panel stores overrides in the
// database; anything not saved yet falls back to these values, so the site always renders fully.

export type SocialPlatform = "facebook" | "linkedin" | "instagram" | "youtube" | "x";
export type Stat = { value: string; label: string; icon: string };
export type LinkItem = { label: string; href: string };
export type Heading = { eyebrow: string; title: string; highlight: string; description: string };

const heading = (eyebrow: string, title: string, highlight = "", description = ""): Heading => ({
  eyebrow,
  title,
  highlight,
  description,
});

export const sectionDefaults = {
  settings: {
    siteName: "Digiline Tech",
    brandFirst: "Digiline",
    brandSecond: "Tech",
    tagline: "Marketing • Web • IT Solutions",
    description: "We help businesses grow through strategic marketing, creative solutions and technology.",
    logo: "/logo.png",
    logoAlt: "Digiline Tech logo",
    favicon: "",
    email: "hello@digilinetech.com",
    phone: "+880 1711 234567",
    location: "Dhaka, Bangladesh",
    locationNote: "We work globally",
    socials: [
      { platform: "facebook", url: "https://facebook.com" },
      { platform: "linkedin", url: "https://linkedin.com" },
      { platform: "instagram", url: "https://instagram.com" },
      { platform: "youtube", url: "https://youtube.com" },
      { platform: "x", url: "https://x.com" },
    ] as { platform: SocialPlatform; url: string }[],
    storyVideo: {
      src: "/videos/our-story.mp4",
      poster: "/videos/our-story-poster.jpg",
      label: "The Digiline Tech team at work",
      title: "Strategy. Creativity. Technology. Real Business Growth.",
      linkLabel: "Watch Our Story",
      linkHref: "/about",
    },
  },

  seo: {
    titleDefault: "Digiline Tech — Marketing, Web & IT Solutions",
    titleTemplate: "%s | Digiline Tech",
    description: "Digiline Tech delivers digital marketing, web development and IT solutions that grow your business.",
    keywords: "digital marketing agency, social media marketing, SEO, web development, Bangladesh",
    ogImage: "/images/hero-laptop.jpg",
    twitterHandle: "",
    googleVerification: "",
    organizationType: "MarketingAgency",
  },

  navigation: {
    items: [
      { label: "Home", href: "/", icon: "house", servicesDropdown: false },
      { label: "Services", href: "/services", icon: "layout-grid", servicesDropdown: true },
      { label: "Case Studies", href: "/case-studies", icon: "folder-kanban", servicesDropdown: false },
      { label: "About Us", href: "/about", icon: "user-round", servicesDropdown: false },
      { label: "Blog", href: "/blog", icon: "newspaper", servicesDropdown: false },
      { label: "Contact", href: "/contact", icon: "mail", servicesDropdown: false },
    ],
    allServicesLabel: "All Services",
    cta: { label: "Free Consultation", href: "/contact" },
    mobileCard: {
      icon: "briefcase-business",
      title: "Get a Free Consultation",
      text: "Let's grow your business together.",
      buttonLabel: "Get Started",
      buttonHref: "/contact",
    },
    bottomTabs: [
      { label: "Home", href: "/", icon: "house" },
      { label: "Services", href: "/services", icon: "layout-grid" },
      { label: "Work", href: "/case-studies", icon: "folder-kanban" },
      { label: "About", href: "/about", icon: "user-round" },
    ],
    bottomCenter: { label: "Let's Talk", href: "/contact", icon: "message-circle" },
  },

  footer: {
    quickLinksTitle: "Quick Links",
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
    ] as LinkItem[],
    servicesTitle: "Services",
    servicesCount: 5,
    newsletterTitle: "Stay Updated",
    newsletterText: "Get the latest tips, resources and updates.",
    newsletterPlaceholder: "Your Email Address",
    newsletterSuccess: "Thanks for subscribing!",
    copyright: "Digiline Tech. All rights reserved.",
    regions: ["Bangladesh", "Global"],
  },

  cta: {
    icon: "lightbulb",
    title: "Have a Project in Mind?",
    description: "Let's discuss how we can help your business grow.",
    buttonLabel: "Get a Free Consultation",
    buttonHref: "/contact",
  },

  intro: {
    enabled: true,
    cornerTitle: "Loading experience",
    cornerSubtitle: "Dhaka — Worldwide",
  },

  home: {
    hero: {
      eyebrow: "Digital Marketing & Tech Solutions",
      titleStart: "Your Growth Partner in the",
      titleHighlight: "Digital World",
      description:
        "We help businesses grow through data-driven marketing, creative strategies and technology solutions. We work with brands in Bangladesh and around the world to turn ideas into measurable results.",
      image: "/images/hero-laptop.jpg",
      imageAlt: "Digital growth dashboard on a laptop",
      primaryButton: { label: "Let's Grow Together", href: "/contact" },
      secondaryButton: { label: "Our Services", href: "/services" },
      stats: [
        { value: "6+", label: "Years of Experience", icon: "award" },
        { value: "$4.5M+", label: "Ad Spend Managed", icon: "dollar-sign" },
        { value: "50+", label: "Happy Clients", icon: "users" },
      ] as Stat[],
      badge: { icon: "trending-up", value: "+230%", label: "Avg. client growth" },
    },
    brands: { label: "Trusted by growing brands in Bangladesh & beyond" },
    services: {
      ...heading(
        "Our Services",
        "Full-Service Digital",
        "Growth Solutions",
        "From strategy to execution, we provide end-to-end digital marketing and tech services to help your brand grow faster, smarter and stronger.",
      ),
      linkLabel: "Explore All Services",
    },
    statement: {
      eyebrow: "Why Digiline Tech",
      text: "We blend *strategy,* *creativity* and *technology* to turn bold ideas into measurable growth for brands in Bangladesh and around the world.",
    },
    about: {
      ...heading(
        "About Us",
        "We're Digiline Tech",
        "Your Growth Partner",
        "A creative team of digital experts, strategists and problem solvers — helping brands grow through data, technology and innovative marketing solutions.",
      ),
      image: "/images/about-team.jpg",
      imageAlt: "The Digiline Tech team",
      badge: { value: "50+", label: "Happy Clients" },
      buttonLabel: "More About Us",
      buttonHref: "/about",
    },
    marquee: { extraItems: ["Brand Strategy", "Analytics"], includeServices: true },
    caseStudies: {
      ...heading("Our Work", "Case Studies", "", "Real brands. Real strategies. Real results."),
      linkLabel: "View All Work",
      count: 3,
    },
    testimonials: {
      ...heading(
        "Testimonials",
        "What Our Clients",
        "Say About Us",
        "Real words from the founders and teams we have helped grow.",
      ),
      rating: "4.9",
      ratingText: "Average rating from 50+ happy clients",
      countBadge: "50+",
      trustText: "Trusted by founders & marketing teams across Bangladesh and beyond",
    },
    blog: { ...heading("Blog", "Insights &", "Resources"), linkLabel: "Read the Blog", count: 3 },
  },

  about: {
    hero: heading(
      "About Us",
      "We're Digiline Tech",
      "Your Growth Partner",
      "A creative team of digital experts, strategists and problem solvers — helping brands grow through data, technology and innovative marketing solutions.",
    ),
    stats: [
      { value: "6+", label: "Years Experience", icon: "award" },
      { value: "50+", label: "Happy Clients", icon: "users" },
      { value: "15+", label: "Countries Served", icon: "globe" },
    ] as Stat[],
    values: heading("What drives us", "Our Values", "", "The principles that guide everything we do."),
    quote: { start: "Your success", highlight: "is our success.", author: "— Digiline Tech" },
  },

  servicesPage: {
    hero: {
      ...heading(
        "Our Services",
        "Full-Service Digital",
        "Growth Solutions",
        "From strategy to execution, we provide end-to-end digital marketing and tech services to help your brand grow faster, smarter and stronger.",
      ),
      buttonLabel: "Explore All Services",
    },
    pricing: {
      startingFrom: "Starting from",
      currency: "৳",
      month: "/ month",
      project: "/ project",
      session: "/ session",
    },
    detail: {
      getStarted: "Get Started",
      subServicesEyebrow: "{count} services included",
      subServicesTitle: "Our {service}",
      subServicesHighlight: "Services",
      subServicesDescription: "Pick exactly what you need — click any service to see what's included and pricing.",
      whatWeDo: "What We Do",
      whyItWorks: "Why It Works",
      moreEyebrow: "More Services",
      moreTitle: "Explore Other",
      moreHighlight: "Solutions",
    },
    subDetail: {
      breadcrumb: "Services",
      included: "What's Included",
      pricing: "Pricing",
      pricingNote: "Final price depends on your goals and scope. Talk to us for a custom quote.",
      quoteButton: "Get a Quote",
      othersTitle: "Other Services in",
      backTo: "Back to",
      cardButton: "Details",
    },
  },

  caseStudiesPage: {
    hero: heading("Our Work", "Case Studies", "", "Real brands. Real strategies. Real results."),
    categories: ["E-commerce", "Lead Generation", "Brand Awareness", "Website & SEO"],
    allLabel: "All",
    emptyText: "No case studies in this category yet.",
    detail: {
      back: "All case studies",
      challenge: "The Challenge",
      solution: "Our Solution",
      client: "Client",
      services: "Services",
    },
  },

  blogPage: {
    hero: heading(
      "Blog",
      "Insights &",
      "Resources",
      "Practical tips and guides on marketing, websites and technology to help your business grow.",
    ),
    readMoreLabel: "Read more",
    backLabel: "Back to blog",
  },

  contactPage: {
    hero: heading(
      "Get in Touch",
      "Let's Work",
      "Together",
      "Have a project in mind? We're here to help. Reach out and let's create something great together.",
    ),
    labels: { email: "Email", phone: "Phone", location: "Location", follow: "Follow us" },
    form: {
      name: "Your Name *",
      email: "Your Email *",
      phone: "Phone Number",
      subject: "Subject",
      message: "Your Message *",
      submit: "Submit",
      sending: "Sending...",
      successTitle: "Message sent!",
      successText: "Thanks for reaching out. We'll get back to you soon.",
      again: "Send another message",
      error: "Couldn't send your message right now. Please try again or email us directly.",
    },
  },

  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    content:
      "Digiline Tech respects your privacy. We only collect the information you share with us through our contact and newsletter forms, and we use it solely to respond to you and send updates you have asked for.\n\nWe never sell your personal data. You can ask us to update or delete your information at any time.",
  },

  terms: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    content:
      "By using this website you agree to these terms. All content on this site belongs to Digiline Tech unless stated otherwise.\n\nProject terms, timelines and payments are agreed separately in each client proposal.",
  },

  notFound: {
    title: "Page not found",
    text: "The page you're looking for doesn't exist or was moved.",
    buttonLabel: "Back to home",
  },
};

export type SectionKey = keyof typeof sectionDefaults;
export type SectionData<K extends SectionKey> = (typeof sectionDefaults)[K];

/** Default SEO title/description for pages before the admin sets their own. */
export const pageSeoDefaults: Partial<Record<SectionKey, { title?: string; description: string; path: string }>> = {
  home: { description: sectionDefaults.seo.description, path: "/" },
  about: { title: "About Us", description: "Meet Digiline Tech — a team of digital experts helping brands grow.", path: "/about" },
  servicesPage: {
    title: "Services",
    description: "Social media marketing, paid ads, SEO, websites, growth consulting and IT solutions.",
    path: "/services",
  },
  caseStudiesPage: { title: "Case Studies", description: "Real brands. Real strategies. Real results.", path: "/case-studies" },
  blogPage: { title: "Blog", description: "Tips, guides and insights on digital marketing, web and technology.", path: "/blog" },
  contactPage: { title: "Contact", description: "Have a project in mind? Get in touch with Digiline Tech.", path: "/contact" },
  privacy: { title: "Privacy Policy", description: "How Digiline Tech collects and uses your information.", path: "/privacy-policy" },
  terms: { title: "Terms & Conditions", description: "The terms for using the Digiline Tech website.", path: "/terms" },
};

/** Recursively applies saved values over defaults. Arrays and primitives from `saved` replace defaults. */
export function mergeContent<T>(defaults: T, saved: unknown): T {
  if (saved === undefined || saved === null) return defaults;
  if (Array.isArray(defaults) || typeof defaults !== "object" || defaults === null) {
    return (typeof saved === typeof defaults || defaults === null ? saved : defaults) as T;
  }
  if (typeof saved !== "object" || Array.isArray(saved)) return defaults;
  const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const [key, value] of Object.entries(saved as Record<string, unknown>)) {
    result[key] = key in result ? mergeContent(result[key], value) : value;
  }
  return result as T;
}
