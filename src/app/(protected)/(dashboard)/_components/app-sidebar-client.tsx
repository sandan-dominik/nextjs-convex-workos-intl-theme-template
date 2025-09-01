"use client";

import * as React from "react";
import { memo } from "react";
import { useTranslations } from "next-intl";
import {
  SquareTerminal,
  MessageSquare,
  CreditCard,
  Sparkles,
} from "lucide-react";

import { NavMain } from "@/app/(protected)/(dashboard)/_components/nav-main";
import { NavUser } from "@/app/(protected)/(dashboard)/_components/nav-user";
import { OrganizationSwitcher } from "@/app/(protected)/(dashboard)/_components/organization-switcher";
import { NavSettings } from "@/app/(protected)/(dashboard)/_components/nav-settings";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useOrganizations, useOrganizationId } from "@/hooks/use-app-store";




function AppSidebarClient({ variant, ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("navigation");
  const organizations = useOrganizations();
  const organizationId = useOrganizationId();

  // Navigation configuration with translations
  const navMain = [
    {
      title: t("dashboard.title"),
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: t("chat"),
      url: "/chat",
      icon: MessageSquare
    }
  ];

  const navSettings = [
    {
      title: t("settings.usageAndCredits"),
      url: "/settings/usage",
      icon: Sparkles,
    },
    {
      title: t("settings.subscription"),
      url: "/settings/subscription",
      icon: CreditCard,
    },
  ];

  // Transform organizations data
  const transformedOrganizations = organizations.map((org, index) => ({
    id: org.id,
    name: org.name,
    iconName: ['Building2', 'GalleryVerticalEnd', 'AudioWaveform', 'Command'][index % 4],
    role: (org.role as Record<string, unknown>)?.slug ? 
      String((org.role as Record<string, unknown>).slug).charAt(0).toUpperCase() + 
      String((org.role as Record<string, unknown>).slug).slice(1) : 
      "ERROR",
    active: org.id === organizationId,
  }));

  return (
    <Sidebar collapsible="icon" variant={variant} {...props}>
      <SidebarHeader>
                        <OrganizationSwitcher organizations={transformedOrganizations} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSettings items={navSettings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// Memoize the component to prevent re-renders
export const MemoizedAppSidebarClient = memo(AppSidebarClient);