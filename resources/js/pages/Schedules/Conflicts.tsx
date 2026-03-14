import { Head, usePage } from '@inertiajs/react'

import { AlertTriangle } from 'lucide-react'
import AppLayout from '@/layouts/app-layout'

interface Conflict {
    type: string
    day: string
    time: string
    message: string
    a: any
    b: any
}

export default function Conflicts() {

    const { conflicts } = usePage().props as unknown as { conflicts: Conflict[] }

    return (

        <AppLayout breadcrumbs={[{ title: "Schedule Conflicts", href: "/schedules/conflicts" }]}>

            <Head title="Schedule Conflicts" />

            <div className="p-6">

                <div className="flex items-center mb-6">

                    <AlertTriangle className="mr-3 text-red-500" size={28} />

                    <h1 className="text-2xl font-bold">
                        Conflict Detection
                    </h1>

                </div>

                {conflicts.length === 0 && (

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">

                        <p className="text-green-700 font-medium">
                            No schedule conflicts detected.
                        </p>

                    </div>

                )}

                <div className="space-y-4">

                    {conflicts.map((c, index) => (

                        <div
                            key={index}
                            className="border rounded-lg p-4 bg-red-50 border-red-200"
                        >

                            <div className="font-semibold text-red-700">
                                {c.type}
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                                {c.day} — {c.time}
                            </div>

                            <div className="text-sm mb-3">
                                {c.message}
                            </div>

                            <div className="text-xs text-gray-600">

                                <div>
                                    {c.a.assignment.subject.subject_code} — {c.a.assignment.section.section_name}
                                </div>

                                <div>
                                    {c.b.assignment.subject.subject_code} — {c.b.assignment.section.section_name}
                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </AppLayout>

    )
}