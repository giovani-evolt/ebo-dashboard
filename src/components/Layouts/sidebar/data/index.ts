import * as Icons from "../icons";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavSubItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "Menu",
    items: [
      {
        title: "Financial Information",
        url: "/",
        icon: Icons.HomeIcon,
        items: [] as NavSubItem[],
      },
      {
        title: "Settlements",
        icon: Icons.Calendar,
        url: "/settlements",
        items: [] as NavSubItem[],
      },
      {
        title: "Units Sold",
        icon: Icons.FourCircle,
        url: "/units-sold",
        items: [] as NavSubItem[]
      },
    ],
  },
  {
    label: "Files",
    items: [
      {
        title: "Csv",
        url: "/csvs",
        icon: Icons.Alphabet,
        items: [] as NavSubItem[],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "User",
        url: "/settings",
        icon: Icons.User,
        items: [] as NavSubItem[],
      },
      {
        title: "Seller",
        url: "/seller",
        icon: Icons.User,
        items: [] as NavSubItem[],
      }
    ],
  },
];
