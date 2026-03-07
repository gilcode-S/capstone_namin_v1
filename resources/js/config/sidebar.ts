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
    SquareBottomDashedScissors,
    ChartNoAxesColumnIncreasingIcon,
    ReceiptEuro
  } from "lucide-react"
  
  export const sidebarConfig: Record<string, any> = {
  
    "super admin": [
      {
        label: "Academics",
        items: [
          { title: "Department", href: "/department", icon: Layers },
          { title: "Program", href: "/program", icon: Layers },
          { title: "Subject", href: "/subject", icon: BookOpen },
          { title: "Section", href: "/section", icon: PanelsRightBottom }
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
          { title: "Assignment", href: "/assignments", icon: ChartNoAxesColumnIncreasingIcon },
          { title: "Schedule Versions", href: "/schedule-versions", icon: Calendar },
          { title: "Generate Schedule", href: "/generate-schedule", icon: PlusCircle },
          { title: "Conflict Detection", href: "/conflict-detection", icon: AlertCircle }
        ]
      },
  
      {
        label: "System",
        items: [
          { title: "Semester Module", href: "/semesters", icon: SquareBottomDashedScissors }
        ]
      }
    ],
  
    registrar: [
      {
        label: "Academics",
        items: [
          { title: "Subject", href: "/subject", icon: BookOpen },
          { title: "Section", href: "/section", icon: PanelsRightBottom },
          { title: "Department", href: "/department", icon: Layers },
          { title: "Program", href: "/program", icon: Layers }
        ]
      },
  
     
    ],
  
    staff: [
      {
        label: "Scheduling",
        items: [
          { title: "Rooms", href: "/rooms", icon: Folder },
          { title: "Time Slots", href: "/time-slots", icon: Clock10Icon },
          { title: "Schedule Versions", href: "/schedule-versions", icon: Calendar },
          { title: "Generate Schedule", href: "/generate-schedule", icon: PlusCircle },
          { title: "Conflict Detection", href: "/conflict-detection", icon: AlertCircle }
        ]
      }
    ],
  
    hr: [
      {
        label: "HR",
        items: [
          { title: "Faculty", href: "/faculty", icon: Users },
          { title: "View Schedule", href: "/view-schedule", icon: Calendar }
        ]
      }
    ]
  
  }