import {
  Award,
  BarChart3,
  DollarSign,
  Globe,
  Heart,
  Lightbulb,
  Megaphone,
  MonitorSmartphone,
  Search,
  Settings,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const icons: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  target: Target,
  search: Search,
  monitor: MonitorSmartphone,
  chart: BarChart3,
  settings: Settings,
  award: Award,
  dollar: DollarSign,
  users: Users,
  globe: Globe,
  heart: Heart,
  bulb: Lightbulb,
  zap: Zap,
};

export function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && icons[name]) || Zap;
  return <Icon className={className} />;
}
