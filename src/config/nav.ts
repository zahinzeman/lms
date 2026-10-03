export type AppRole = "student" | "creator" | "moderator" | "admin";

export type Workspace = "learning" | "creator" | "admin";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  roles: AppRole[];
  badgeKey?: string;
  featureFlag?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const learningNav: NavGroup[] = [
  {
    group: "Main",
    items: [
      { label: "Home", href: "/dashboard", icon: "Home", roles: ["student", "creator", "moderator", "admin"] },
      { label: "Explore", href: "/explore", icon: "Compass", roles: ["student", "creator", "moderator", "admin"] },
      { label: "My Learning", href: "/learning", icon: "GraduationCap", roles: ["student", "creator", "moderator", "admin"] },
      { label: "Communities", href: "/communities", icon: "Users", roles: ["student", "creator", "moderator", "admin"] },
      { label: "My Library", href: "/library", icon: "FolderDown", roles: ["student", "creator", "moderator", "admin"] },
    ],
  },
  {
    group: "Activity",
    items: [
      { label: "Wishlist", href: "/wishlist", icon: "Heart", roles: ["student", "creator", "moderator", "admin"] },
      { label: "Certificates", href: "/certificates", icon: "Award", roles: ["student", "creator", "moderator", "admin"] },
      { label: "Notifications", href: "/notifications", icon: "Bell", roles: ["student", "creator", "moderator", "admin"], badgeKey: "unreadNotifications" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Orders", href: "/orders", icon: "Receipt", roles: ["student", "creator", "moderator", "admin"] },
      { label: "Subscriptions", href: "/subscriptions", icon: "Repeat", roles: ["student", "creator", "moderator", "admin"] },
      { label: "Settings", href: "/settings", icon: "Settings", roles: ["student", "creator", "moderator", "admin"] },
    ],
  },
];

export const creatorNav: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/studio", icon: "LayoutDashboard", roles: ["creator", "admin"] },
      { label: "Analytics", href: "/studio/analytics", icon: "BarChart3", roles: ["creator", "admin"] },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "Courses", href: "/studio/courses", icon: "BookOpen", roles: ["creator", "admin"] },
      { label: "Digital Products", href: "/studio/products", icon: "Boxes", roles: ["creator", "admin"] },
      { label: "Communities", href: "/studio/communities", icon: "Users2", roles: ["creator", "admin"] },
      { label: "Memberships & Plans", href: "/studio/plans", icon: "BadgePercent", roles: ["creator", "admin"] },
    ],
  },
  {
    group: "Audience",
    items: [
      { label: "Students", href: "/studio/students", icon: "UserCheck", roles: ["creator", "admin"] },
      { label: "Reviews & Q&A", href: "/studio/reviews", icon: "MessageSquare", roles: ["creator", "admin"], badgeKey: "unansweredQuestions" },
      { label: "Coupons", href: "/studio/coupons", icon: "Ticket", roles: ["creator", "admin"] },
    ],
  },
  {
    group: "Money",
    items: [
      { label: "Sales", href: "/studio/sales", icon: "DollarSign", roles: ["creator", "admin"] },
      { label: "Payouts", href: "/studio/payouts", icon: "CreditCard", roles: ["creator", "admin"] },
    ],
  },
  {
    group: "Brand",
    items: [
      { label: "Storefront", href: "/studio/storefront", icon: "Store", roles: ["creator", "admin"] },
      { label: "Studio Settings", href: "/studio/settings", icon: "Sliders", roles: ["creator", "admin"] },
    ],
  },
];

export const adminNav: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: "Shield", roles: ["moderator", "admin"] },
      { label: "Analytics", href: "/admin/analytics", icon: "TrendingUp", roles: ["moderator", "admin"] },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: "Users", roles: ["moderator", "admin"] },
      { label: "Creator Applications", href: "/admin/creators", icon: "FileSignature", roles: ["moderator", "admin"], badgeKey: "pendingApplications" },
    ],
  },
  {
    group: "Catalog",
    items: [
      { label: "Course Review Queue", href: "/admin/courses", icon: "BookCheck", roles: ["moderator", "admin"], badgeKey: "pendingCourses" },
      { label: "Products", href: "/admin/products", icon: "Package", roles: ["moderator", "admin"] },
      { label: "Communities", href: "/admin/communities", icon: "MessagesSquare", roles: ["moderator", "admin"] },
      { label: "Categories", href: "/admin/categories", icon: "FolderTree", roles: ["moderator", "admin"] },
    ],
  },
  {
    group: "Money",
    items: [
      { label: "Orders & Refunds", href: "/admin/orders", icon: "Receipt", roles: ["moderator", "admin"], badgeKey: "pendingRefunds" },
      { label: "Payouts", href: "/admin/payouts", icon: "Banknote", roles: ["moderator", "admin"], badgeKey: "pendingPayouts" },
      { label: "Platform Coupons", href: "/admin/coupons", icon: "Tag", roles: ["moderator", "admin"] },
      { label: "Plans & Fees", href: "/admin/plans", icon: "Coins", roles: ["moderator", "admin"] },
    ],
  },
  {
    group: "Trust",
    items: [
      { label: "Reports", href: "/admin/reports", icon: "Flag", roles: ["moderator", "admin"], badgeKey: "openReports" },
      { label: "Audit Log", href: "/admin/audit", icon: "FileText", roles: ["admin"] },
    ],
  },
  {
    group: "Site",
    items: [
      { label: "Homepage CMS", href: "/admin/cms", icon: "Layers", roles: ["admin"] },
      { label: "Settings", href: "/admin/settings", icon: "SlidersHorizontal", roles: ["admin"] },
    ],
  },
];
