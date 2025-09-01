"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { switchToSelectedOrganization } from "@/app/actions/auth"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { SubscriptionBadge } from "@/components/autumn/subscription-badge"
import { AutumnWrapper } from "../../_components/autumn-wrapper"
import { memo } from "react"
import { useTranslations } from "next-intl"

interface Organization {
  id: string
  name: string
  iconName?: string
  role: string
  active: boolean
}



export function OrganizationSwitcher({
  organizations,
}: {
  organizations: Organization[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const t = useTranslations("components.OrganizationSwitcher")
  // Find the active organization from the props
  const activeOrganization = organizations.find(org => org.active) || organizations[0]

  if (!activeOrganization || organizations.length === 0) {
    return null
  }

  const handleOrganizationSwitch = async (organization: Organization) => {
    if (organization.id === activeOrganization.id) return

    setIsLoading(true)
    try {
      await switchToSelectedOrganization(organization.id)
    } catch (error) {
      if ((error as Error).message === 'NEXT_REDIRECT') {
        // Let Next.js handle the redirect
        throw error
      }
      console.error('Failed to switch organization:', error)
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isLoading}
            >
              <div className="flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground">
                <div className="">{activeOrganization.name[0].toUpperCase() + activeOrganization.name[1].toUpperCase()}</div>
              </div>
              <div className="flex-1 grid text-sm text-left leading-tight">
                <span className="font-medium truncate">{activeOrganization.name}</span>
                <span className="text-xs truncate">
                  <AutumnWrapper loadingVariant="none">
                    <SubscriptionBadge variant="text" />
                  </AutumnWrapper>
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="rounded-lg w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {t("organizations")}
            </DropdownMenuLabel>
            {organizations.map((organization, index) => {
              return (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => handleOrganizationSwitch(organization)}
                  className={`gap-2 p-2 ${organization.active ? 'bg-accent' : ''} cursor-pointer`}
                  disabled={isLoading}
                >
                  <div className="flex justify-center items-center bg-sidebar-primary rounded-md size-6 aspect-square text-sidebar-primary-foreground">
                    <div className="">{organization.name[0].toUpperCase() + organization.name[1].toUpperCase()}</div>
                  </div>
                  <div className="flex-1">
                    <span className={organization.active ? 'font-medium' : ''}>
                      {organization.name}
                    </span>
                    {organization.active && (
                      <span className="block text-muted-foreground text-xs">
                        {t("current")}
                      </span>
                    )}
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator className="hidden" />
            <DropdownMenuItem 
              className="hidden gap-2 p-2 cursor-pointer"
              onClick={() => router.push('/onboarding')}
            >
              <div className="flex justify-center items-center bg-transparent border rounded-md size-6">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add organization</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export const MemoizedOrganizationSwitcher = memo(OrganizationSwitcher);