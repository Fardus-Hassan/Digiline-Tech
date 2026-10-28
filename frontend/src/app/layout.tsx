import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSection, getSiteSettings } from "@/lib/content";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([getSection("seo"), getSiteSettings()]);
  const image = seo.ogImage ? [{ url: absoluteUrl(seo.ogImage) }] : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: site.siteName,
    title: { default: seo.titleDefault, template: seo.titleTemplate || `%s | ${site.siteName}` },
    description: seo.description,
    keywords: seo.keywords || undefined,
    openGraph: {
      type: "website",
      siteName: site.siteName,
      locale: "en_US",
      title: seo.titleDefault,
      description: seo.description,
      url: SITE_URL,
      images: image,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.titleDefault,
      description: seo.description,
      images: image?.map((i) => i.url),
      ...(seo.twitterHandle ? { site: seo.twitterHandle, creator: seo.twitterHandle } : {}),
    },
    ...(site.favicon ? { icons: { icon: site.favicon, apple: site.favicon } } : {}),
    ...(seo.googleVerification ? { verification: { google: seo.googleVerification } } : {}),
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}

export const viewport: Viewport = {
  themeColor: "#03162f",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('dt-intro-seen'))d.classList.add('intro-done')}catch(e){}setTimeout(function(){d.classList.add('intro-done')},6000)})()",
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
