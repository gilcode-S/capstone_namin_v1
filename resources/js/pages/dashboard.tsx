import { Head, usePage, router } from '@inertiajs/react'
import {
    Users,
    Building2,

    BookOpen,
    Sparkles,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    Layout,
} from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import SummaryCard from '@/components/SummaryCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
]

export default function Dashboard() {

    const { totalFaculty, totalRooms, totalSections, totalSubjects, summary }: any = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="0000000000000000000000"></div>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">

                {/* ===================== */}
                {/* TOP METRICS */}
                {/* ===================== */}
                <div className="grid gap-4 md:grid-cols-4">
                    <MetricCard icon={Users} label="Total Faculty" value={totalFaculty} />
                    <MetricCard icon={Building2} label="Total Rooms" value={totalRooms} />
                    <MetricCard icon={Layout} label="Total Sections" value={totalSections} />
                    <MetricCard icon={BookOpen} label="Total Subject" value={totalSubjects} />
                </div>

                {/* ===================== */}
                {/* AI GENERATOR */}
                {/* ===================== */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">AI Schedule Generator</h2>
                                <p className="text-sm text-muted-foreground">
                                    Generate optimized schedules using Hybrid Algorithm
                                </p>
                            </div>
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600">
                                Greedy + CP-SAT
                            </span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex items-center gap-3">

                        <Button
                            onClick={() => router.visit('/generate-schedule')}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Sparkles size={16} />
                            Generate Schedule
                        </Button>

                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.visit('/generate-schedule')}
                        >
                            <RotateCcw size={16} />
                            Manage
                        </Button>

                    </CardContent>
                </Card>

                {/* ===================== */}
                {/* SUMMARY + STATUS */}
                {/* ===================== */}
                <div className="grid gap-4 md:grid-cols-3">

                    <SummaryCard title="Scheduled Classes" value={summary.schedule} />
                    <SummaryCard title="Unassigned" value={summary.unassigned} />
                    <SummaryCard title="Conflicts" value={summary.conflicts} danger />

                </div>

                {/* ALERT */}
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                    <AlertTriangle size={18} />
                    Conflicts detected in schedule
                </div>

                {/* ===================== */}
                {/* TIMETABLE */}
                {/* ===================== */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Weekly Timetable</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-left">Time</th>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <th key={day} className="p-2">{day}</th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {['7:00', '9:00', '11:00', '1:00', '3:00'].map(time => (
                                        <tr key={time}>
                                            <td className="p-2 font-medium">{time}</td>

                                            {[...Array(6)].map((_, i) => (
                                                <td key={i} className="p-2">
                                                    <div className="rounded-xl bg-indigo-100 p-2 text-xs text-indigo-700">
                                                        CS101<br />
                                                        Room 1<br />
                                                        Prof A
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* ===================== */}
                {/* BOTTOM GRID */}
                {/* ===================== */}
                <div className="grid gap-4 md:grid-cols-3">

                    {/* RECENT ACTIVITY */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>✅ Schedule generated • 2 mins ago</p>
                            <p>➕ Faculty added • 10 mins ago</p>
                            <p>✏️ Room updated • 1 hour ago</p>
                        </CardContent>
                    </Card>

                    {/* QUICK ACTIONS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="outline">Add Faculty</Button>
                            <Button variant="outline">Add Room</Button>
                            <Button variant="outline">Add Section</Button>
                            <Button variant="outline">Create Assignment</Button>
                        </CardContent>
                    </Card>

                    {/* SYSTEM STATUS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 size={16} /> Optimal
                            </p>
                            <p>Generation Time: 2.3s</p>
                            <p>Last Generated: 5 mins ago</p>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    )
}






/* ========================= */
/* COMPONENTS */
/* ========================= */


