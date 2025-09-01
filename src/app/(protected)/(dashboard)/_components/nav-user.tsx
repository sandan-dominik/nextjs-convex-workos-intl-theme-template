"use client"

import {
  ChevronsUpDown,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import SignOutButton from "@/app/(protected)/(dashboard)/_components/sign-out-button"
import { useUser, useActiveProduct } from "@/hooks/use-app-store"
import Link from "next/link"

export function NavUser() {
  const { isMobile } = useSidebar()
  const user = useUser()
  const activeProduct = useActiveProduct()
  
  // Check if user has an active pro subscription
  const hasProSubscription = activeProduct && activeProduct.status === "active"

  // Don't render until user is loaded
  if (!user) {
    return null
  }

  // Transform user data for display
  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0]
  const avatarUrl = user.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.email)}&background=random`

  return (
    <SidebarMenu className="cursor-pointer">
      <SidebarMenuItem className="cursor-pointer">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:cursor-pointer"
            >
              <Avatar className="rounded-lg w-8 h-8">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="flex-1 grid text-sm text-left leading-tight">
                <span className="font-medium truncate">{displayName}</span>
                <span className="text-xs truncate">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="rounded-lg w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
                <Avatar className="rounded-lg w-8 h-8">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="flex-1 grid text-sm text-left leading-tight">
                  <span className="font-medium truncate">{displayName}</span>
                  <span className="text-xs truncate">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {hasProSubscription ? (
                <DropdownMenuItem className="font-medium text-amber-600 dark:text-amber-400 pointer-events-none">
                  <Sparkles className="mr-2 text-amber-500" />
                  Pro
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Link href="/dashboard/subscription">  
                  <Sparkles className="mr-2" />
                  Upgrade to Pro
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}