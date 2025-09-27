import { MenuItem } from "@/data/types/menu";

import {
  Menu,
  Users,
  ClipboardList,
  Briefcase,
  Building,
  Plus,
  Pencil,
  Trash,
} from "lucide-react";
export const menuItems: MenuItem[] = [
  {
    label: "My Profile",
    icon: <Menu />,
    roles: ["user", "admin", "manager"],
    path: "/user/profile",
  },
  {
    label: "My Orders",
    icon: <ClipboardList />,
    roles: ["user"],
    path: "/user/orders",
  },
  {
    label: "My Reviews",
    icon: <Briefcase />,
    roles: ["user"],
    path: "/user/reviews",
  },

  {
    label: "Manage Users",
    icon: <Users />,
    roles: ["admin", "manager"],
    path: "/admin/users",
  },
  {
    label: "Manage Products",
    icon: <Briefcase />,
    roles: ["admin"],
    submenu: [
      { label: "Add Product", icon: <Plus />, action: "addProduct" },
      {
        label: "Edit Product",
        icon: <Pencil />,
        path: "/admin/products/edit",
      },
      {
        label: "Delete Product",
        icon: <Trash />,
        path: "/admin/products/delete",
      },
    ],
  },
  {
    label: "Manage Company",
    icon: <Building />,
    roles: ["admin"],
    submenu: [
      {
        label: "Update Company",
        icon: <Pencil />,
        path: "/admin/company/update",
      },
      {
        label: "Delete Company",
        icon: <Trash />,
        path: "/admin/company/delete",
      },
    ],
  },
  { label: "Users", path: "/users", icon: <Users />, roles: ["admin"] },
];
