import { Head, usePage, router } from '@inertiajs/react'
import {
    Users,
    Building2,
    BookOpen,
    Clock,
} from 'lucide-react'
import ActionCard from '@/components/ActionCard'
import Metric from '@/components/Metric'
import Progress from '@/components/Progress'
import { Card, CardContent } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'

export default function Dashboard() {
    const page = usePage().props as any

    const metrics = page.metrics ?? {
        faculty: 0,
        rooms: 0,
        subjects: 0,
    }
    const optimization = page.optimization ?? {
        workload: 0,
        rooms: 0,
        compactness: 0,
        conflicts: 0,
    }

    const summary = page.summary ?? {
        conflicts: 0,
    }

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-semibold">
                        AISAT Scheduling Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Automated scheduling system with conflict detection
                    </p>
                </div>


                <div className="grid md:grid-cols-4 gap-4">

                    <Metric icon={Users} title="Total Teachers" value={metrics.faculty} subtitle="Active faculty members" />
                    <Metric icon={Building2} title="Classrooms" value={metrics.rooms} subtitle="Available rooms & labs" />
                    <Metric icon={BookOpen} title="Subjects" value={metrics.subjects} subtitle="Courses to schedule" />
                    <Metric icon={Clock} title="Weekly Hours" value="2,835" subtitle="Total teaching hours" />

                </div>


                <div className="grid md:grid-cols-2 gap-4">

                    {/* OPTIMIZATION METRICS */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-5 space-y-4">
                            <div>
                                <h2 className="font-semibold">Optimization Metrics</h2>
                                <p className="text-sm text-muted-foreground">
                                    Current performance of the scheduling optimization algorithm
                                </p>
                            </div>

                            <Progress label="Teacher Workload Balance" value={optimization.workload} />
                            <Progress label="Room Utilization" value={optimization.rooms} />
                            <Progress label="Schedule Compactness" value={optimization.compactness} />
                            <Progress label="Conflict Minimization" value={optimization.conflicts} />
                        </CardContent>
                    </Card>

                    {/* RECENT ACTIVITY */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-5 space-y-4">
                            <div>
                                <h2 className="font-semibold">Recent Activities</h2>
                                <p className="text-sm text-muted-foreground">
                                    Latest updates and system notifications
                                </p>
                            </div>

                            <div className="space-y-3 text-sm">
                                <p>✅ Schedule optimization completed</p>
                                <p className="text-yellow-600">
                                    ⚠ {summary.conflicts} conflicts detected
                                </p>
                                <p>👤 New faculty added</p>
                                <p>🏫 New room added</p>
                            </div>
                        </CardContent>
                    </Card>

                </div>

         
                <Card className="rounded-2xl">
                    <CardContent className="p-5">
                        <h2 className="font-semibold mb-4">Quick Actions</h2>

                        <div className="grid md:grid-cols-3 gap-4">

                            <ActionCard
                                title="Generate New Schedule"
                                description="Run optimization algorithm"
                                onClick={() => router.visit('/generate-schedule')}
                            />

                            <ActionCard
                                title="Resolve Conflicts"
                                description="Review scheduling conflicts"
                                onClick={() => router.visit('/conflicts')}
                            />

                            <ActionCard
                                title="Manage Faculty"
                                description="Update availability and preferences"
                                onClick={() => router.visit('/faculty')}
                            />

                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    )
}








