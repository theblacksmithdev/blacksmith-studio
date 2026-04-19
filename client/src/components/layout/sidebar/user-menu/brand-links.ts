import { GraduationCap, Users, type LucideIcon } from "lucide-react";

export interface BrandLink {
  id: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  url: string;
}

/**
 * Brand-owned external destinations shown in the user menu. URLs are
 * placeholders — swap in the real ones once they're live. Keeping the
 * list here (not in the component) means we can add / reorder entries
 * without touching the rendering code.
 */
export const BRAND_LINKS: BrandLink[] = [
  {
    id: "academic",
    icon: GraduationCap,
    // Short-label here; the "Blacksmith" brand is already established
    // by the menu header, so the prefix would just waste horizontal space.
    label: "Academic",
    hint: "Blacksmith Academic — tutorials, playbooks, and deep dives",
    url: "https://blacksmith.studio/academic",
  },
  {
    id: "community",
    icon: Users,
    label: "Community",
    hint: "Blacksmith Community — chat with other builders",
    url: "https://blacksmith.studio/community",
  },
];
