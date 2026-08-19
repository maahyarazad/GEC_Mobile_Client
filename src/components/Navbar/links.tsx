import { INavbarLinks } from "../../@types/Links";
import {
  MdDashboard,
  MdAssignment,
  MdPeople,
  MdPhoneIphone,
  MdArticle,
  MdManageAccounts,
  MdEvent,
  MdChecklist,
  MdNotifications,
  MdWork,
  MdFolder,
  MdBarChart,
  MdVerified,
  MdPersonSearch,
  MdAssignmentTurnedIn,
  MdMenuBook,
  MdLogout,
} from "react-icons/md";

export const links: INavbarLinks[] = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    icon: MdDashboard,
  },
  {
    id: 75,
    name: "Access Requests",
    link: "/requests",
    icon: MdAssignment,
  },
  {
    id: 76,
    name: "Partner List",
    link: "/partner",
    icon: MdPeople,
  },
  {
    id: 77,
    name: "Banner Control",
    link: "/apps",
    icon: MdPhoneIphone,
  },
  {
    id: 78,
    name: "Posts",
    link: "/posts",
    icon: MdArticle,
  },
  {
    id: 79,
    name: "User List",
    link: "/users",
    icon: MdManageAccounts,
  },
  {
    id: 80,
    name: "Events",
    link: "/events",
    icon: MdEvent,
  },
  {
    id: 81,
    name: "Event Guest Call List",
    link: "/guest-list",
    icon: MdChecklist,
  },
  {
    id: 82,
    name: "Push Notification",
    link: "/push-notification",
    icon: MdNotifications,
  },
  {
    id: 83,
    name: "Careers",
    link: "/careers",
    icon: MdWork,
  },
  {
    id: 84,
    name: "Files",
    link: "/files",
    icon: MdFolder,
  },
  {
    id: 85,
    name: "Reports",
    link: "/reports",
    icon: MdBarChart,
  },
  {
    id: 86,
    name: "Experts",
    link: "/experts",
    icon: MdVerified,
  },
  {
    id: 87,
    name: "Prospect Partner",
    link: "/prospects",
    icon: MdPersonSearch,
  },
  {
    id: 88,
    name: "Partner Onboarding",
    link: "/partner-onboarding",
    icon: MdAssignmentTurnedIn,
  },
  {
    // No `id`: the Knowledge Base is visible to every authenticated admin
    // (like Dashboard). Navbar hides any link whose `id` has no granted role,
    // and this feature introduces no permission of its own.
    name: "Knowledge Base",
    link: "/knowledge-base",
    icon: MdMenuBook,
  },
  {
    name: "Log Out",
    link: "/logout",
    color: "bg-red-600",
    icon: MdLogout,
  },
];
