import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "Menu",
    items: [
      {
        title: "Financial Information",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Settlements",
        icon: Icons.Calendar,
        url: "/settlements",
        items: [],
      },
      {
        title: "Units Sold",
        icon: Icons.FourCircle,
        url: "/units-sold",
        items: []
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
        items: [],
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
        items: [],
      },
      {
        title: "Seller",
        url: "/seller",
        icon: Icons.User,
        items: [],
      }
    ],
  },
];
