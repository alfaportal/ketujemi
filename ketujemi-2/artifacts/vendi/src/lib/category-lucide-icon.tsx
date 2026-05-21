import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Bike,
  Briefcase,
  Building2,
  Car,
  Dumbbell,
  GraduationCap,
  Home,
  Laptop,
  Music,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Tag,
  Truck,
  Tv,
  Wheat,
  Wrench,
  Zap,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Baby,
  Bike,
  Briefcase,
  Building2,
  Car,
  Dumbbell,
  GraduationCap,
  Home,
  Laptop,
  Music,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Tag,
  Truck,
  Tv,
  Wheat,
  Wrench,
  Zap,
};

/** Resolve a seeded category `icon` string without importing all of lucide-react. */
export function getCategoryLucideIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Tag;
  return CATEGORY_ICONS[iconName] ?? Tag;
}
