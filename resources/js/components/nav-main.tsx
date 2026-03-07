import { Link } from '@inertiajs/react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'


import { useCurrentUrl } from '@/hooks/use-current-url'
import type { NavItem } from '@/types'

export function NavMain({ label, items = [] }: { label: string; items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl()
    const [open, setOpen] = useState(true)

    return (
        <SidebarGroup className="px-2">

            {/* GROUP HEADER */}
            <SidebarGroupLabel
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <span>{label}</span>

                <ChevronDown
                    size={16}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </SidebarGroupLabel>

            {/* GROUP MENU */}
            {open && (
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            )}
        </SidebarGroup>
    )
}