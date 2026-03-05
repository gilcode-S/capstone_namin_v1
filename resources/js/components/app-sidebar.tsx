import { Link, usePage } from '@inertiajs/react';

import { AlertCircle, BookOpen, Calendar, ChartBar, ChartBarIcon, Clock10Icon, Folder, Home, Layers, LayoutGrid, PanelsRightBottom, PilcrowRight, PilcrowRightIcon, PlusCircle, ReceiptEuro, SquareBottomDashedScissors, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },

    {
        title: 'Analytics',
        href: '/analytics',
        icon: ChartBar,
    },
    {
        title: 'Rooms',
        href: '/room',
        icon: Folder,
    },
    {
        title: 'Faculty',
        href: '/faculty',
        icon: Users,
    },
    {
        title: 'Subject',
        href: '/subject',
        icon: BookOpen,
    },
    {
        title: 'Section',
        href: '/section',
        icon: PanelsRightBottom,
    },
    {
        title: 'Department',
        href: '/department',
        icon: Layers,
    },
    {
        title: 'Program',
        href: '/program',
        icon: PilcrowRightIcon,
    },
    {
        title: 'Records',
        href: '/records',
        icon: Layers,
    },
    {
        title: 'View Schedule',
        href: '/view-schedule',
        icon: Calendar,
    },
    {
        title: 'Generate Schedule',
        href: '/generate-schedule',
        icon: PlusCircle,
    },
    {
        title: 'Conflict Detection',
        href: '/conflict Detection',
        icon: AlertCircle,
    },
    {
        title: 'History Version',
        href: '/history-version',
        icon: Clock10Icon,
    },
];


const hrNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Faculty',
        href: '/faculty',
        icon: Users,
    },
    {
        title: 'View Schedule',
        href: '/view-schedule',
        icon: Calendar,
    },
    {
        title: 'Resource',
        href: '/Resource',
        icon: Folder,
    },
];

const registrarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Subject',
        href: '/subject',
        icon: BookOpen,
    },
    {
        title: 'Section',
        href: '/section',
        icon: Layers,
    },
    {
        title: 'Department',
        href: '/department',
        icon: Layers,
    },
    {
        title: 'Program',
        href: '/program',
        icon: PilcrowRight,
    },
    {
        title: 'Records',
        href: '/records',
        icon: ReceiptEuro,
    },
    {
        title: 'Rooms',
        href: '/rooms',
        icon: ChartBarIcon,
    },
]
const staffNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Rooms',
        href: '/rooms',
        icon: Folder,
    },
    {
        title: 'Time Slots',
        href: '/time-slots',
        icon: Folder,
    },
    {
        title: 'Semester Module',
        href: '/semesters',
        icon: SquareBottomDashedScissors,
    },
    {
        title: 'Schedule Versions',
        href: '/schedule-versions',
        icon: Calendar,
    },
    {
        title: 'Generate Schedule',
        href: '/generate-schedule',
        icon: PlusCircle,
    },
    {
        title: 'Conflict Detection',
        href: '/conflict Detection',
        icon: AlertCircle,
    },
    {
        title: 'History Version',
        href: '/history-version',
        icon: Clock10Icon,
    },
]

const footerNavItems: NavItem[] = [
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    let roleNavItems: NavItem[] = [];

    switch (user?.role) {
        case 'super admin':
            roleNavItems = mainNavItems;
            break;
        case 'hr':
            roleNavItems = hrNavItems;
            break;
        case 'registrar':
            roleNavItems = registrarNavItems;
            break;
        case 'staff':
            roleNavItems = staffNavItems;
            break;
        default:
            roleNavItems = [];
    }
    return (
        <Sidebar collapsible="icon" variant="inset">
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

            <SidebarContent>
                <NavMain items={roleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
