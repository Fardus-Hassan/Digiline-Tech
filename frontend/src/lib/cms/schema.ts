// Describes every editable field so the admin panel can build its forms automatically.
// Field names must match the keys in `defaults.ts` (sections) and `types.ts` (collections).
import {
  BookOpen,
  Briefcase,
  Building2,
  Footprints,
  Gem,
  Home,
  Info,
  Layers,
  LayoutTemplate,
  Mail,
  Menu,
  MessageSquareQuote,
  Newspaper,
  Rocket,
  Scale,
  SearchCheck,
  SearchX,
  Settings,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { CollectionKey } from "@/lib/cms/types";
import type { SectionKey } from "@/lib/cms/defaults";

type Base = { name: string; label: string; help?: string; placeholder?: string; width?: "half" | "full" };

export type Field =
  | (Base & { type: "text"; maxLength?: number })
  | (Base & { type: "textarea"; rows?: number; maxLength?: number })
  | (Base & { type: "markdown" })
  | (Base & { type: "number"; min?: number; max?: number; step?: number })
  | (Base & { type: "url" })
  | (Base & { type: "image" })
  | (Base & { type: "video" })
  | (Base & { type: "icon" })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "toggle" })
  | (Base & { type: "date" })
  | (Base & { type: "rating" })
  | (Base & { type: "price" })
  | (Base & { type: "link" })
  | (Base & { type: "list"; addLabel?: string })
  | (Base & { type: "group"; fields: Field[] })
  | (Base & { type: "repeater"; fields: Field[]; itemTitle?: string; addLabel?: string; max?: number });

export type FieldType = Field["type"];

/** A card of related fields. `path` scopes the fields to a nested object of the section/entry data. */
export type Panel = { title: string; description?: string; path?: string; fields: Field[] };

export type SectionSchema = {
  key: SectionKey;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Pages" | "Site settings";
  /** Public URL of the page, for the "View page" button. */
  path?: string;
  /** Page sections get their own SEO card. */
  seo?: boolean;
  panels: Panel[];
};

export type CollectionSchema = {
  key: CollectionKey;
  label: string;
  singular: string;
  description: string;
  icon: LucideIcon;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  iconField?: string;
  /** Public URL of an entry, for the "View" button. */
  path?: (slug: string, parentSlug?: string) => string;
  seo: boolean;
  parent?: CollectionKey;
  child?: { collection: CollectionKey; label: string };
  /** Hidden from the sidebar (managed from its parent instead). */
  hidden?: boolean;
  panels: Panel[];
};

// ---------- field helpers ----------

const text = (name: string, label: string, extra: Partial<Base> & { maxLength?: number } = {}): Field => ({
  type: "text",
  name,
  label,
  ...extra,
});
const textarea = (name: string, label: string, extra: Partial<Base> & { rows?: number; maxLength?: number } = {}): Field => ({
  type: "textarea",
  name,
  label,
  ...extra,
});
const half = (field: Field): Field => ({ ...field, width: "half" });
const url = (name: string, label: string, help = "A page on this site like /contact, or a full https:// link"): Field => ({
  type: "url",
  name,
  label,
  help,
  width: "half",
});
const image = (name: string, label: string, help?: string): Field => ({ type: "image", name, label, help });
const icon = (name = "icon", label = "Icon"): Field => ({ type: "icon", name, label, width: "half" });
const link = (name: string, label: string, help?: string): Field => ({ type: "link", name, label, help });
const list = (name: string, label: string, addLabel = "Add item", help?: string): Field => ({
  type: "list",
  name,
  label,
  addLabel,
  help,
});
const number = (name: string, label: string, extra: { min?: number; max?: number; help?: string } = {}): Field => ({
  type: "number",
  name,
  label,
  width: "half",
  ...extra,
});

const headingFields = (descriptionLabel = "Description"): Field[] => [
  half(text("eyebrow", "Small label above title", { help: "The small orange text above the heading" })),
  half(text("title", "Title")),
  text("highlight", "Highlighted title", { help: "Shown on a new line with the orange gradient. Leave empty to hide." }),
  textarea("description", descriptionLabel, { rows: 3 }),
];

const statFields: Field[] = [half(text("value", "Number", { placeholder: "50+" })), half(text("label", "Label")), icon()];

const socialPlatforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
];

// ---------- sections ----------

export const sectionSchemas: SectionSchema[] = [
  {
    key: "home",
    label: "Home page",
    description: "Hero, section headings and buttons on the home page.",
    icon: Home,
    group: "Pages",
    path: "/",
    seo: true,
    panels: [
      {
        title: "Hero",
        description: "The first thing visitors see.",
        path: "hero",
        fields: [
          text("eyebrow", "Small label above title"),
          half(text("titleStart", "Title")),
          half(text("titleHighlight", "Highlighted words", { help: "Shown with the orange gradient" })),
          textarea("description", "Description", { rows: 3 }),
          image("image", "Hero image", "Landscape image, at least 1600px wide"),
          text("imageAlt", "Image description (alt text)", { help: "Describes the image for Google and screen readers" }),
          link("primaryButton", "Main button"),
          link("secondaryButton", "Second button"),
          {
            type: "repeater",
            name: "stats",
            label: "Stats",
            itemTitle: "label",
            addLabel: "Add stat",
            max: 3,
            fields: statFields,
          },
          {
            type: "group",
            name: "badge",
            label: "Floating badge (desktop)",
            fields: [icon(), half(text("value", "Number")), text("label", "Label")],
          },
        ],
      },
      {
        title: "Brands strip",
        description: "The logo marquee under the hero. Add or remove logos from Brands.",
        path: "brands",
        fields: [text("label", "Label")],
      },
      {
        title: "Services section",
        path: "services",
        fields: [...headingFields(), text("linkLabel", "“See all” link text")],
      },
      {
        title: "Statement",
        description: "The big scrolling sentence.",
        path: "statement",
        fields: [
          text("eyebrow", "Small label"),
          textarea("text", "Statement", { rows: 3, help: "Wrap words in *stars* to highlight them in orange" }),
        ],
      },
      {
        title: "About preview",
        path: "about",
        fields: [
          ...headingFields(),
          image("image", "Image"),
          text("imageAlt", "Image description (alt text)"),
          { type: "group", name: "badge", label: "Orange badge", fields: [half(text("value", "Number")), half(text("label", "Label"))] },
          half(text("buttonLabel", "Button text")),
          url("buttonHref", "Button link"),
        ],
      },
      {
        title: "Scrolling text ribbon",
        path: "marquee",
        fields: [
          { type: "toggle", name: "includeServices", label: "Include service names", help: "Adds every service title to the ribbon" },
          list("extraItems", "Extra words", "Add word"),
        ],
      },
      {
        title: "Case studies section",
        path: "caseStudies",
        fields: [...headingFields(), half(text("linkLabel", "“See all” link text")), number("count", "How many to show", { min: 1, max: 12 })],
      },
      {
        title: "Testimonials section",
        description: "Reviews themselves are managed in Testimonials.",
        path: "testimonials",
        fields: [
          ...headingFields(),
          half(text("rating", "Average rating", { placeholder: "4.9" })),
          half(text("countBadge", "Client count badge", { placeholder: "50+" })),
          text("ratingText", "Rating caption"),
          text("trustText", "Trust line"),
        ],
      },
      {
        title: "Blog section",
        path: "blog",
        fields: [...headingFields(), half(text("linkLabel", "“See all” link text")), number("count", "How many posts to show", { min: 1, max: 12 })],
      },
    ],
  },
  {
    key: "about",
    label: "About page",
    description: "Page header, stats, values heading and quote.",
    icon: Info,
    group: "Pages",
    path: "/about",
    seo: true,
    panels: [
      { title: "Page header", path: "hero", fields: headingFields() },
      {
        title: "Stats",
        fields: [{ type: "repeater", name: "stats", label: "Stats", itemTitle: "label", addLabel: "Add stat", max: 3, fields: statFields }],
      },
      {
        title: "Values heading",
        description: "The value cards themselves are managed in Values.",
        path: "values",
        fields: headingFields(),
      },
      {
        title: "Quote",
        path: "quote",
        fields: [half(text("start", "First line")), half(text("highlight", "Highlighted line")), text("author", "Author line")],
      },
    ],
  },
  {
    key: "servicesPage",
    label: "Services pages",
    description: "Services page header, prices format and labels on service pages.",
    icon: LayoutTemplate,
    group: "Pages",
    path: "/services",
    seo: true,
    panels: [
      { title: "Page header", path: "hero", fields: [...headingFields(), text("buttonLabel", "Button text")] },
      {
        title: "Price format",
        description: "How starting prices are shown on every service card.",
        path: "pricing",
        fields: [
          half(text("startingFrom", "Label above price")),
          half(text("currency", "Currency symbol", { placeholder: "৳" })),
          half(text("month", "Per month text")),
          half(text("project", "Per project text")),
          half(text("session", "Per session text")),
        ],
      },
      {
        title: "Service page labels",
        description: "Use {count} for the number of sub-services and {service} for the service name.",
        path: "detail",
        fields: [
          half(text("getStarted", "Main button text")),
          half(text("whatWeDo", "Features heading")),
          half(text("whyItWorks", "“Why it works” heading")),
          half(text("subServicesEyebrow", "Sub-services small label")),
          half(text("subServicesTitle", "Sub-services title")),
          half(text("subServicesHighlight", "Sub-services highlighted title")),
          textarea("subServicesDescription", "Sub-services description", { rows: 2 }),
          half(text("moreEyebrow", "Other services small label")),
          half(text("moreTitle", "Other services title")),
          half(text("moreHighlight", "Other services highlighted title")),
        ],
      },
      {
        title: "Sub-service page labels",
        path: "subDetail",
        fields: [
          half(text("breadcrumb", "Breadcrumb first item")),
          half(text("included", "“What's included” heading")),
          half(text("pricing", "Pricing heading")),
          half(text("quoteButton", "Quote button text")),
          textarea("pricingNote", "Pricing note", { rows: 2 }),
          half(text("othersTitle", "Other sub-services title")),
          half(text("backTo", "Back link text")),
          half(text("cardButton", "Card button text")),
        ],
      },
    ],
  },
  {
    key: "caseStudiesPage",
    label: "Case studies pages",
    description: "Page header, filter categories and detail page labels.",
    icon: Briefcase,
    group: "Pages",
    path: "/case-studies",
    seo: true,
    panels: [
      { title: "Page header", path: "hero", fields: headingFields() },
      {
        title: "Filter",
        fields: [
          list("categories", "Categories", "Add category", "A case study shows under a filter when its category matches exactly"),
          half(text("allLabel", "“All” button text")),
          half(text("emptyText", "Empty message")),
        ],
      },
      {
        title: "Case study page labels",
        path: "detail",
        fields: [
          half(text("back", "Back link text")),
          half(text("challenge", "Challenge heading")),
          half(text("solution", "Solution heading")),
          half(text("client", "Client label")),
          half(text("services", "Services label")),
        ],
      },
    ],
  },
  {
    key: "blogPage",
    label: "Blog pages",
    description: "Blog header and labels.",
    icon: Newspaper,
    group: "Pages",
    path: "/blog",
    seo: true,
    panels: [
      { title: "Page header", path: "hero", fields: headingFields() },
      { title: "Labels", fields: [half(text("readMoreLabel", "“Read more” text")), half(text("backLabel", "Back link text"))] },
    ],
  },
  {
    key: "contactPage",
    label: "Contact page",
    description: "Page header, contact labels and form text.",
    icon: Mail,
    group: "Pages",
    path: "/contact",
    seo: true,
    panels: [
      { title: "Page header", path: "hero", fields: headingFields() },
      {
        title: "Contact details labels",
        description: "The email, phone and address themselves are in Site settings.",
        path: "labels",
        fields: [
          half(text("email", "Email label")),
          half(text("phone", "Phone label")),
          half(text("location", "Location label")),
          half(text("follow", "Social links label")),
        ],
      },
      {
        title: "Contact form",
        path: "form",
        fields: [
          half(text("name", "Name placeholder")),
          half(text("email", "Email placeholder")),
          half(text("phone", "Phone placeholder")),
          half(text("subject", "Subject placeholder")),
          text("message", "Message placeholder"),
          half(text("submit", "Submit button text")),
          half(text("sending", "Sending text")),
          half(text("successTitle", "Success title")),
          half(text("again", "“Send another” button text")),
          textarea("successText", "Success message", { rows: 2 }),
          textarea("error", "Error message", { rows: 2 }),
        ],
      },
    ],
  },
  {
    key: "privacy",
    label: "Privacy policy",
    description: "Privacy policy page content.",
    icon: ShieldCheck,
    group: "Pages",
    path: "/privacy-policy",
    seo: true,
    panels: [
      {
        title: "Content",
        fields: [half(text("eyebrow", "Small label")), half(text("title", "Title")), { type: "markdown", name: "content", label: "Page content" }],
      },
    ],
  },
  {
    key: "terms",
    label: "Terms & conditions",
    description: "Terms page content.",
    icon: Scale,
    group: "Pages",
    path: "/terms",
    seo: true,
    panels: [
      {
        title: "Content",
        fields: [half(text("eyebrow", "Small label")), half(text("title", "Title")), { type: "markdown", name: "content", label: "Page content" }],
      },
    ],
  },
  {
    key: "notFound",
    label: "404 page",
    description: "Shown when a page doesn't exist.",
    icon: SearchX,
    group: "Pages",
    panels: [{ title: "Content", fields: [text("title", "Title"), textarea("text", "Message", { rows: 2 }), text("buttonLabel", "Button text")] }],
  },
  {
    key: "settings",
    label: "General",
    description: "Logo, site name, contact details, social links and the story video.",
    icon: Settings,
    group: "Site settings",
    panels: [
      {
        title: "Brand & logo",
        fields: [
          text("siteName", "Site name"),
          half(text("brandFirst", "Logo text — first word")),
          half(text("brandSecond", "Logo text — orange word")),
          text("tagline", "Tagline", { help: "Separate parts with •" }),
          textarea("description", "Short description", { rows: 2, help: "Shown in the footer" }),
          image("logo", "Logo", "PNG or SVG with a transparent background"),
          text("logoAlt", "Logo description (alt text)"),
          image("favicon", "Browser tab icon (favicon)", "Square PNG, 512×512 recommended. Leave empty to use the default."),
        ],
      },
      {
        title: "Contact details",
        fields: [
          half(text("email", "Email")),
          half(text("phone", "Phone")),
          half(text("location", "Location")),
          half(text("locationNote", "Location note")),
        ],
      },
      {
        title: "Social media",
        fields: [
          {
            type: "repeater",
            name: "socials",
            label: "Social links",
            itemTitle: "platform",
            addLabel: "Add social link",
            fields: [
              { type: "select", name: "platform", label: "Platform", options: socialPlatforms, width: "half" },
              { type: "url", name: "url", label: "Profile link", width: "half" },
            ],
          },
        ],
      },
      {
        title: "Story video",
        description: "Plays on the home, services and about pages.",
        path: "storyVideo",
        fields: [
          { type: "video", name: "src", label: "Video", help: "MP4 works everywhere. Keep it under ~50 MB for fast loading." },
          image("poster", "Cover image", "Shown before the video starts"),
          text("label", "Video description (for screen readers)"),
          textarea("title", "Text on the video card", { rows: 2 }),
          half(text("linkLabel", "Link text")),
          url("linkHref", "Link"),
        ],
      },
    ],
  },
  {
    key: "navigation",
    label: "Navigation",
    description: "Main menu, mobile menu and the phone tab bar.",
    icon: Menu,
    group: "Site settings",
    panels: [
      {
        title: "Main menu",
        fields: [
          {
            type: "repeater",
            name: "items",
            label: "Menu items",
            itemTitle: "label",
            addLabel: "Add menu item",
            fields: [
              half(text("label", "Text")),
              url("href", "Link"),
              icon("icon", "Icon (mobile menu)"),
              { type: "toggle", name: "servicesDropdown", label: "Show services dropdown", width: "half" },
            ],
          },
          text("allServicesLabel", "“All services” dropdown text"),
          link("cta", "Header button"),
        ],
      },
      {
        title: "Mobile menu card",
        path: "mobileCard",
        fields: [
          icon(),
          half(text("title", "Title")),
          text("text", "Text"),
          half(text("buttonLabel", "Button text")),
          url("buttonHref", "Button link"),
        ],
      },
      {
        title: "Phone tab bar",
        description: "The app-style bar at the bottom of phones. Tabs are split evenly around the round button.",
        fields: [
          {
            type: "repeater",
            name: "bottomTabs",
            label: "Tabs",
            itemTitle: "label",
            addLabel: "Add tab",
            max: 4,
            fields: [half(text("label", "Text")), url("href", "Link"), icon()],
          },
          { type: "group", name: "bottomCenter", label: "Round centre button", fields: [half(text("label", "Text")), url("href", "Link"), icon()] },
        ],
      },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "Footer links, newsletter text and copyright.",
    icon: Footprints,
    group: "Site settings",
    panels: [
      {
        title: "Quick links",
        fields: [
          text("quickLinksTitle", "Column title"),
          {
            type: "repeater",
            name: "quickLinks",
            label: "Links",
            itemTitle: "label",
            addLabel: "Add link",
            fields: [half(text("label", "Text")), url("href", "Link")],
          },
        ],
      },
      { title: "Services column", fields: [half(text("servicesTitle", "Column title")), number("servicesCount", "How many services", { min: 1, max: 20 })] },
      {
        title: "Newsletter",
        fields: [
          half(text("newsletterTitle", "Title")),
          half(text("newsletterPlaceholder", "Email placeholder")),
          text("newsletterText", "Text"),
          text("newsletterSuccess", "Success message"),
        ],
      },
      { title: "Bottom bar", fields: [text("copyright", "Copyright text", { help: "© and the year are added automatically" }), list("regions", "Regions", "Add region")] },
    ],
  },
  {
    key: "cta",
    label: "Call to action",
    description: "The “Have a project in mind?” card at the end of pages.",
    icon: Rocket,
    group: "Site settings",
    panels: [
      {
        title: "Card",
        fields: [
          icon(),
          text("title", "Title"),
          textarea("description", "Description", { rows: 2 }),
          half(text("buttonLabel", "Button text")),
          url("buttonHref", "Button link"),
        ],
      },
    ],
  },
  {
    key: "intro",
    label: "Intro animation",
    description: "The loading animation on a visitor's first page view.",
    icon: Sparkles,
    group: "Site settings",
    panels: [
      {
        title: "Intro",
        description: "Logo, name and tagline come from General settings.",
        fields: [
          { type: "toggle", name: "enabled", label: "Show intro animation" },
          half(text("cornerTitle", "Corner title")),
          half(text("cornerSubtitle", "Corner subtitle")),
        ],
      },
    ],
  },
  {
    key: "seo",
    label: "SEO",
    description: "How the site appears on Google and when shared on social media.",
    icon: SearchCheck,
    group: "Site settings",
    panels: [
      {
        title: "Default search appearance",
        description: "Used when a page doesn't set its own SEO.",
        fields: [
          text("titleDefault", "Home page title", { maxLength: 70 }),
          text("titleTemplate", "Title format for other pages", { help: "%s is replaced with the page title" }),
          textarea("description", "Default description", { rows: 3, maxLength: 160, help: "Best between 120 and 160 characters" }),
          text("keywords", "Keywords", { help: "Comma separated" }),
          image("ogImage", "Social share image", "Shown when links are shared on Facebook, WhatsApp, etc. 1200×630 recommended."),
        ],
      },
      {
        title: "Advanced",
        fields: [
          half(text("twitterHandle", "X (Twitter) handle", { placeholder: "@digilinetech" })),
          half(text("googleVerification", "Google Search Console code")),
          {
            type: "select",
            name: "organizationType",
            label: "Business type (structured data)",
            width: "half",
            options: [
              { value: "MarketingAgency", label: "Marketing agency" },
              { value: "ProfessionalService", label: "Professional service" },
              { value: "LocalBusiness", label: "Local business" },
              { value: "Organization", label: "Organization" },
            ],
          },
        ],
      },
    ],
  },
];

// ---------- collections ----------

const priceField: Field = { type: "price", name: "startingPrice", label: "Starting price" };

export const collectionSchemas: CollectionSchema[] = [
  {
    key: "services",
    label: "Services",
    singular: "Service",
    description: "Your main services, with prices and their sub-services.",
    icon: Layers,
    titleField: "title",
    subtitleField: "excerpt",
    iconField: "icon",
    path: (slug) => `/services/${slug}`,
    seo: true,
    child: { collection: "subServices", label: "Sub-services" },
    panels: [
      {
        title: "Card",
        description: "How the service appears in service grids.",
        fields: [
          half(text("title", "Title")),
          half(text("shortTitle", "Short title", { help: "Used in the footer and breadcrumbs" })),
          icon(),
          textarea("excerpt", "Short description", { rows: 2 }),
          priceField,
        ],
      },
      {
        title: "Service page",
        fields: [
          text("heroTitle", "Page title"),
          textarea("description", "Page description", { rows: 3 }),
          image("image", "Image"),
          list("features", "What we do", "Add feature"),
          textarea("whyItWorks", "Why it works", { rows: 2 }),
        ],
      },
    ],
  },
  {
    key: "subServices",
    label: "Sub-services",
    singular: "Sub-service",
    description: "Services offered inside a main service.",
    icon: Layers,
    titleField: "title",
    subtitleField: "excerpt",
    path: (slug, parentSlug) => `/services/${parentSlug}/${slug}`,
    seo: true,
    parent: "services",
    hidden: true,
    panels: [
      {
        title: "Basics",
        fields: [
          text("title", "Title"),
          textarea("excerpt", "Short description", { rows: 2, help: "Shown on the card" }),
          textarea("description", "Full description", { rows: 3 }),
        ],
      },
      { title: "Pricing & delivery", fields: [priceField, text("turnaround", "Turnaround", { placeholder: "Starts within 3 days" })] },
      {
        title: "Details",
        fields: [
          list("deliverables", "What's included", "Add item"),
          image("image", "Image", "Optional — the parent service image is used when empty"),
        ],
      },
    ],
  },
  {
    key: "caseStudies",
    label: "Case studies",
    singular: "Case study",
    description: "Client success stories.",
    icon: Briefcase,
    titleField: "title",
    subtitleField: "client",
    imageField: "image",
    path: (slug) => `/case-studies/${slug}`,
    seo: true,
    panels: [
      {
        title: "Basics",
        fields: [
          text("title", "Title"),
          half(text("client", "Client")),
          half(text("category", "Category", { help: "Should match a category in Case studies pages → Filter" })),
          image("image", "Cover image"),
          textarea("summary", "Summary", { rows: 2 }),
        ],
      },
      {
        title: "Headline result",
        description: "Shown on the card.",
        path: "metric",
        fields: [half(text("value", "Number", { placeholder: "+230%" })), half(text("label", "Label"))],
      },
      { title: "Story", fields: [textarea("challenge", "The challenge", { rows: 3 }), textarea("solution", "Our solution", { rows: 3 })] },
      {
        title: "Results & services",
        fields: [
          {
            type: "repeater",
            name: "results",
            label: "Results",
            itemTitle: "label",
            addLabel: "Add result",
            max: 3,
            fields: [half(text("value", "Number")), half(text("label", "Label"))],
          },
          list("services", "Services used", "Add service"),
        ],
      },
    ],
  },
  {
    key: "posts",
    label: "Blog posts",
    singular: "Blog post",
    description: "Articles and guides.",
    icon: BookOpen,
    titleField: "title",
    subtitleField: "category",
    imageField: "image",
    path: (slug) => `/blog/${slug}`,
    seo: true,
    panels: [
      {
        title: "Basics",
        fields: [
          text("title", "Title"),
          textarea("excerpt", "Summary", { rows: 2 }),
          half(text("category", "Category")),
          half({ type: "date", name: "date", label: "Publish date" }),
          half(text("readTime", "Reading time", { placeholder: "5 min read" })),
          image("image", "Cover image"),
        ],
      },
      { title: "Article", fields: [{ type: "markdown", name: "content", label: "Content" }] },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "Client reviews on the home page.",
    icon: MessageSquareQuote,
    titleField: "name",
    subtitleField: "company",
    imageField: "avatar",
    path: () => "/",
    seo: false,
    panels: [
      {
        title: "Review",
        fields: [
          half(text("name", "Name")),
          half(text("role", "Role")),
          half(text("company", "Company")),
          half({ type: "rating", name: "rating", label: "Rating" }),
          textarea("quote", "Review", { rows: 4 }),
          image("avatar", "Photo", "Optional — initials are shown when empty"),
        ],
      },
      { title: "Result badge", description: "Optional highlight shown next to the name.", path: "result", fields: [half(text("value", "Number")), half(text("label", "Label"))] },
    ],
  },
  {
    key: "brands",
    label: "Brands",
    singular: "Brand",
    description: "Client logos in the “Trusted by” strip.",
    icon: Building2,
    titleField: "name",
    imageField: "logo",
    iconField: "icon",
    path: () => "/",
    seo: false,
    panels: [
      {
        title: "Brand",
        fields: [
          text("name", "Name"),
          image("logo", "Logo", "Optional — without a logo, the name is shown with the icon below"),
          icon(),
          {
            type: "select",
            name: "wordmark",
            label: "Name style (without logo)",
            width: "half",
            options: [
              { value: "bold", label: "Bold" },
              { value: "serif", label: "Elegant serif" },
              { value: "mono", label: "Tech mono" },
              { value: "wide", label: "Wide spaced" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "values",
    label: "Values",
    singular: "Value",
    description: "Company values on the home and about pages.",
    icon: Gem,
    titleField: "title",
    subtitleField: "description",
    iconField: "icon",
    path: () => "/about",
    seo: false,
    panels: [{ title: "Value", fields: [half(text("title", "Title")), icon(), text("description", "Description")] }],
  },
];

export const getSectionSchema = (key: string) => sectionSchemas.find((s) => s.key === key);
export const getCollectionSchema = (key: string) => collectionSchemas.find((c) => c.key === key);

/** Empty starting value for a field, used for new entries and new repeater items. */
export function emptyValue(field: Field): unknown {
  switch (field.type) {
    case "number":
      return field.min ?? 0;
    case "toggle":
      return false;
    case "rating":
      return 5;
    case "price":
      return { amount: 0, period: "month" };
    case "link":
      return { label: "", href: "" };
    case "list":
    case "repeater":
      return [];
    case "group":
      return emptyObject(field.fields);
    case "select":
      return field.options[0]?.value ?? "";
    case "date":
      return new Date().toISOString().slice(0, 10);
    default:
      return "";
  }
}

export function emptyObject(fields: Field[]) {
  return Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));
}

/** Empty data for a new entry, built from all of its panels. */
export function emptyEntryData(schema: CollectionSchema) {
  const data: Record<string, unknown> = {};
  for (const panel of schema.panels) {
    const values = emptyObject(panel.fields);
    if (panel.path) data[panel.path] = { ...(data[panel.path] as object), ...values };
    else Object.assign(data, values);
  }
  return data;
}
