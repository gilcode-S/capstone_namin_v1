import { Link, usePage } from "@inertiajs/react"
import { LayoutGrid } from "lucide-react"

import { NavFooter } from "@/components/nav-footer"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

import { dashboard } from "@/routes/index"
import AppLogo from "./app-logo"

import { sidebarConfig } from "@/config/sidebar"

export function AppSidebar() {

  const { auth } = usePage<any>().props
  const user = auth?.user

  const roleSections = sidebarConfig[user?.role] ?? []

  return (
    <Sidebar collapsible="icon" variant="inset">

      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>


      {/* SIDEBAR CONTENT */}
      <SidebarContent className="overflow-y-auto scrollbar-hide">

        {/* DASHBOARD */}
        <NavMain
          label="Dashboard"
          items={[
            {
              title: "Dashboard",
              href: dashboard(),
              icon: LayoutGrid
            }
          ]}
        />

        {/* ROLE BASED SECTIONS */}
        {roleSections.map((section: any) => (
          <NavMain
            key={section.label}
            label={section.label}
            items={section.items}
          />
        ))}

      </SidebarContent>


      {/* FOOTER */}
      <SidebarFooter>
        <NavFooter items={[]} className="mt-auto" />
        <NavUser />
      </SidebarFooter>

    </Sidebar>
  )
}