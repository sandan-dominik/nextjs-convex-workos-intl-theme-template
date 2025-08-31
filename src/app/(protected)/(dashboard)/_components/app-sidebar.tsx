"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Building2,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
} from "lucide-react"

import { NavMain } from "@/app/(protected)/(dashboard)/_components/nav-main"
import { NavUser } from "@/app/(protected)/(dashboard)/_components/nav-user"
import { OrganizationSwitcher } from "@/app/(protected)/(dashboard)/_components/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar: string
  }
  organizations: {
    id: string
    name: string
    iconName: string
    role: string
    active: boolean
  }[]
  variant?: "inset" | "sidebar" | "floating"
}

// Icon mapping
const iconMap = {
  Building2,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
}

// Navigation configuration - customize as needed
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal,
    items: [
      {
        title: "Overview",
        url: "/dashboard",
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: "/settings",
      },
      {
        title: "Subscription",
        url: "/subscription",
      },
    ],
  },
]

export function AppSidebar({ user, organizations, variant, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant={variant} {...props}>
      <SidebarHeader>
        <OrganizationSwitcher organizations={organizations} iconMap={iconMap} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}