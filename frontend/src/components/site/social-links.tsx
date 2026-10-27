import { socialIcons, socialLabels } from "@/components/icons/social-icons";
import type { SocialPlatform } from "@/lib/content";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  socials: { platform: SocialPlatform; url: string }[];
  className?: string;
  variant?: "outline" | "plain";
};

export function SocialLinks({ socials, className, variant = "outline" }: SocialLinksProps) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {socials.map(({ platform, url }) => {
        const Icon = socialIcons[platform];
        return (
          <li key={platform}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLabels[platform]}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent hover:text-white",
                variant === "outline" && "border border-border",
              )}
            >
              <Icon className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
