import * as lucide from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

const toComponentName = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/**
 * Renders a Lucide icon from its kebab-case name (as chosen in the admin icon picker).
 * Server-only: importing every icon is fine on the server, so pass the rendered element to client components.
 */
export function DynamicIcon({ name, ...props }: { name?: string } & LucideProps) {
  const Icon = (
    name && name in dynamicIconImports ? lucide[toComponentName(name) as keyof typeof lucide] : lucide.Sparkles
  ) as LucideIcon;
  return <Icon {...props} />;
}
