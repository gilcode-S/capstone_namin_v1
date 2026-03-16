import { Head, usePage } from '@inertiajs/react'
import { AlertTriangle } from 'lucide-react'
import AppLayout from '@/layouts/app-layout'


interface Section {
    section_name: string
}

interface Subject {
    subject_code: string
    subject_name: string
}

interface Faculty {
    first_name: string
    last_name: string
}

interface Assignment {
    section: Section
    subject: Subject
    faculty: Faculty
}

interface Room {
    room_name: string
}

interface TimeSlot {
    day_of_week: string
    start_time: string
    end_time: string
}

interface Schedule {
    id: number
    assignment: Assignment
    room: Room
    timeslot: TimeSlot
}

interface Conflict {
    type: string
    items: Schedule[]
}

export default function Conflicts() {

    const { conflicts } = usePage().props as unknown as {
        conflicts: Conflict[]
    }

    return (

        <AppLayout breadcrumbs={[{ title: "Schedule Conflicts", href: "/schedules/conflicts" }]}>

            <Head title="Schedule Conflicts" />

            <div className="p-6">

                {/* HEADER */}
                <div className="flex items-center mb-6">

                    <AlertTriangle className="mr-3 text-red-500" size={28} />

                    <h1 className="text-2xl font-bold">
                        Smart Conflict Detection
                    </h1>

                </div>

                {/* NO CONFLICT */}
                {conflicts.length === 0 && (

                    <div className="bg-white border rounded-lg shadow-sm p-6 text-gray-500">
                        No conflicts detected 🎉
                    </div>

                )}

                {/* CONFLICT LIST */}

                <div className="space-y-6">

                    {conflicts.map((conflict, index) => {

                        const first = conflict.items[0]

                        return (

                            <div
                                key={index}
                                className="border rounded-lg shadow-sm bg-white"
                            >

                                {/* CONFLICT HEADER */}
                                <div className="bg-red-50 border-b px-4 py-3 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <AlertTriangle
                                            className="text-red-500"
                                            size={18}
                                        />

                                        <span className="font-semibold text-red-600">
                                            {conflict.type}
                                        </span>

                                    </div>

                                    <span className="text-sm text-gray-500">

                                        {first.timeslot.day_of_week}{" "}
                                        {first.timeslot.start_time} -{" "}
                                        {first.timeslot.end_time}

                                    </span>

                                </div>

                                {/* CONFLICT ITEMS */}

                                <div className="divide-y">

                                    {conflict.items.map(schedule => (

                                        <div
                                            key={schedule.id}
                                            className="p-4 grid grid-cols-4 gap-4 text-sm"
                                        >

                                            <div>
                                                <div className="font-medium">
                                                    Section
                                                </div>

                                                {schedule.assignment.section.section_name}
                                            </div>

                                            <div>
                                                <div className="font-medium">
                                                    Subject
                                                </div>

                                                {schedule.assignment.subject.subject_code} -{" "}
                                                {schedule.assignment.subject.subject_name}
                                            </div>

                                            <div>
                                                <div className="font-medium">
                                                    Faculty
                                                </div>

                                                {schedule.assignment.faculty?.first_name}{" "}
                                                {schedule.assignment.faculty?.last_name}
                                            </div>

                                            <div>
                                                <div className="font-medium">
                                                    Room
                                                </div>

                                                {schedule.room.room_name}
                                            </div>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        )

                    })}

                </div>

            </div>

        </AppLayout>

    )
}