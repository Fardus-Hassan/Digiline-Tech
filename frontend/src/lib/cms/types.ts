export type Seo = {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  noindex?: boolean;
} | null;

export type PricePeriod = "month" | "project" | "session" | "";
export type Price = { amount: number; period?: PricePeriod };

export type Service = {
  title: string;
  shortTitle: string;
  icon: string;
  excerpt: string;
  startingPrice: Price;
  heroTitle: string;
  description: string;
  image: string;
  features: string[];
  whyItWorks: string;
};

export type SubService = {
  title: string;
  excerpt: string;
  description: string;
  startingPrice: Price;
  deliverables: string[];
  turnaround: string;
  image?: string;
};

export type CaseStudy = {
  title: string;
  client: string;
  category: string;
  image: string;
  metric: { value: string; label: string };
  summary: string;
  challenge: string;
  solution: string;
  results: { value: string; label: string }[];
  services: string[];
};

export type BlogPost = {
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  content: string;
};

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  result?: { value: string; label: string };
  avatar?: string;
};

export type Wordmark = "bold" | "serif" | "mono" | "wide";
export type Brand = { name: string; icon: string; logo?: string; wordmark?: Wordmark };

export type Value = { title: string; description: string; icon: string };

export type CollectionData = {
  services: Service;
  subServices: SubService;
  caseStudies: CaseStudy;
  posts: BlogPost;
  testimonials: Testimonial;
  brands: Brand;
  values: Value;
};

export type CollectionKey = keyof CollectionData;

/** An entry as the website receives it: its data plus routing and SEO metadata. */
export type Entry<T> = T & {
  id: string;
  slug: string;
  seo: Seo;
  updatedAt: string;
  publishedAt: string | null;
  parentSlug?: string;
};
