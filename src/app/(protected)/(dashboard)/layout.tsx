import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebarWrapper from "@/app/(protected)/(dashboard)/_components/app-sidebar-wrapper"
import { Breadcrumb, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbItem, BreadcrumbList, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { AutumnWrapper } from "../_components/autumn-wrapper"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AutumnWrapper>
            <SidebarProvider>
                <AppSidebarWrapper variant="inset" />
                <SidebarInset className="relative">
                    <header className="flex items-center gap-2 h-12 transition-[width] ease-linear shrink-0">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">
                                            Building Your Application
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="relative flex flex-col h-[calc(100vh-4rem)]">
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AutumnWrapper>
    )
}
