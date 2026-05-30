import {
  Layers,
  BookOpen,
  PanelsRightBottom,
  Folder,
  Users,
  Clock10Icon,
  Calendar,
  PlusCircle,
  AlertCircle,

  ChartNoAxesColumnIncreasingIcon,
  ScanHeart,
  HeartCrack,
} from "lucide-react"

export const sidebarConfig = {

  "super admin": [
    {
      label: "Analytics",
      items: [
        {
          title: "Analytics",
          href: "/analytics",
          icon: ChartNoAxesColumnIncreasingIcon
        }
      ]
    },
    {
      label: "Academics",
      items: [
        { title: "Academics", href: "/academics", icon: Layers },
        { title: "Subject", href: "/subjects", icon: BookOpen },
        { title: "Section", href: "/section", icon: PanelsRightBottom },
        { title: "Curriculum", href: "/curriculum", icon: Layers },
      ]
    },

    {
      label: "Resources",
      items: [
        { title: "Rooms", href: "/rooms", icon: Folder },
        { title: "Faculty", href: "/faculty", icon: Users },
  
        { title: "Time Slots", href: "/time-slots", icon: Clock10Icon }
      ]
    },

    {
      label: "Scheduling",
      items: [
 
        { title: "Schedule Versions", href: "/version-history", icon: Calendar },
        { title: "View Schedule", href: '/schedules/viewer', icon: ScanHeart },
        { title: "Generate Schedule", href: '/schedules/generator', icon: PlusCircle },
        { title: "Conflict Detection", href: "/conflicts", icon: AlertCircle } // ✅ FIXED
      ]
    },
  

    {
      label: "System",
      items: [
  
        { title: "Account Management", href: "/users", icon: HeartCrack },
        { title: "Audit Logs", href: "/audit-logs", icon: ScanHeart }
      ]
    }
  ],

  registrar: [
    {
      label: "Analytics",
      items: [
        {
          title: "Analytics",
          href: "/analytics",
          icon: ChartNoAxesColumnIncreasingIcon
        }
      ]
    },
    {
      
      label: "Academics",
      items: [
        { title: "Subject", href: "/subjects", icon: BookOpen },
        { title: "Section", href: "/section", icon: PanelsRightBottom },
        // { title: "Academics", href: "/academics", icon: Layers },
        { title: "Curriculum", href: "/curriculum", icon: Layers },
      ]
    }
  ],

  staff: [
    {
      label: "Analytics",
      items: [
        {
          title: "Analytics",
          href: "/analytics",
          icon: ChartNoAxesColumnIncreasingIcon
        }
      ]
    },
    {
      label: "Scheduling",
      items: [
        { title: "Rooms", href: "/rooms", icon: Folder },
        { title: "Curriculum", href: "/curriculum", icon: Layers },
        // { title: "Schedule Versions", href: "/version-history", icon: Calendar },
        { title: "Generate Schedule", href: '/schedules/generator', icon: PlusCircle },
        { title: "Conflict Detection", href: "/conflicts", icon: AlertCircle }, // ✅ FIXED
        { title: "View Schedule", href: '/schedules/viewer', icon: ScanHeart }, // ✅ FIXED
      ]
    }
  ],

  hr: [
    {
      label: "Analytics",
      items: [
        {
          title: "Analytics",
          href: "/analytics",
          icon: ChartNoAxesColumnIncreasingIcon
        }
      ]
    },
    {
      label: "HR",
      items: [
        { title: "Faculty", href: "/faculty", icon: Users },
       // { title: "View Schedule", href: '/schedules/viewer', icon: ScanHeart }, // ✅ FIXED
      ]
    }
  ]

}