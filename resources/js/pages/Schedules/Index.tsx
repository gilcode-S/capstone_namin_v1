import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Trash2, CalendarDays } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'

interface Semester {
    id: number
    school_year: number
    term: string
}

interface Version {
    id: number
    version_number: number
    semester: Semester
}

interface Section {
    id: number
    section_name: string
}

interface Subject {
    id: number
    subject_code: string
    subject_name: string
}

interface Faculty {
    id: number
    first_name: string
    last_name: string
}

interface Assignment {
    id: number
    section: Section
    subject: Subject
    faculty: Faculty
}

interface Room {
    id: number
    room_name: string
}

interface Timeslot {
    id: number
    day_of_week: string
    start_time: string
    end_time: string
}

interface Schedule {
    id: number
    version: Version
    assignment: Assignment
    room: Room
    timeslot: Timeslot
}

const emptyForm = {
    schedule_version_id: '',
    assignment_id: '',
    room_id: '',
    time_slot_id: ''
}

export default function Index() {

    const { schedules, assignments, rooms, timeslots, versions } =
        usePage().props as unknown as {
            schedules: Schedule[],
            assignments: Assignment[],
            rooms: Room[],
            timeslots: Timeslot[],
            versions: Version[]
        }

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [loading, setLoading] = useState(false)

    const handleOpen = () => {
        setForm(emptyForm)
        setOpen(true)
    }

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()

        setLoading(true)

        router.post('/schedules', form, {
            onSuccess: () => {
                setLoading(false)
                setOpen(false)
            }
        })
    }

    const handleDelete = (id: number) => {
        if (!confirm('Delete this schedule?')) return

        router.delete(`/schedules/${id}`)
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Schedules", href: "/schedules" }]}>
            <Head title="Schedules" />

            <div className="p-6">

                {/* HEADER */}

                <div className="flex justify-between items-center mb-6">

                    <div className="flex items-center">
                        <CalendarDays className="mr-2 text-blue-500" size={28} />
                        <h1 className="text-2xl font-bold">
                            Schedule Management
                        </h1>
                    </div>

                    <Button onClick={handleOpen} className="gap-2">
                        <Plus size={18} />
                        Add Schedule
                    </Button>

                </div>

                {/* TABLE */}

                <div className="overflow-x-auto rounded-lg border shadow">

                    <table className="min-w-full">

                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Version</th>
                                <th className="px-4 py-2 text-left">Section</th>
                                <th className="px-4 py-2 text-left">Subject</th>
                                <th className="px-4 py-2 text-left">Faculty</th>
                                <th className="px-4 py-2 text-left">Room</th>
                                <th className="px-4 py-2 text-left">Time</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {schedules.length > 0 ? schedules.map(s => (

                                <tr key={s.id} className="border-t">

                                    <td className="px-4 py-2">
                                        <div className="font-semibold">
                                            Version {s.version.version_number}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            SY {s.version.semester.school_year} • {s.version.semester.term}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2">
                                        {s.assignment.section.section_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {s.assignment.subject.subject_code} — {s.assignment.subject.subject_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {s.assignment.faculty.first_name} {s.assignment.faculty.last_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {s.room.room_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {s.timeslot.day_of_week} {s.timeslot.start_time} - {s.timeslot.end_time}
                                    </td>

                                    <td className="px-4 py-2 text-center">

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(s.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>

                                    </td>

                                </tr>

                            )) : (

                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        No schedules created yet
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* MODAL */}

                <Dialog open={open} onOpenChange={setOpen}>

                    <DialogContent>

                        <DialogHeader>
                            <DialogTitle>Create Schedule</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* VERSION */}

                            <div>
                                <Label>Schedule Version</Label>
                                <select
                                    name="schedule_version_id"
                                    value={form.schedule_version_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Version</option>

                                    {versions.map(v => (
                                        <option key={v.id} value={v.id}>
                                            SY {v.semester.school_year}  |  {v.semester.term}  |  Version  {v.version_number}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            {/* ASSIGNMENT */}

                            <div>
                                <Label>Assignment</Label>
                                <select
                                    name="assignment_id"
                                    value={form.assignment_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Assignment</option>

                                    {assignments.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.section.section_name} — {a.subject.subject_code} — {a.faculty.first_name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            {/* ROOM */}

                            <div>
                                <Label>Room</Label>
                                <select
                                    name="room_id"
                                    value={form.room_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Room</option>

                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.room_name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            {/* TIMESLOT */}

                            <div>
                                <Label>Time Slot</Label>
                                <select
                                    name="time_slot_id"
                                    value={form.time_slot_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Time Slot</option>

                                    {timeslots.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.day_of_week} {t.start_time} - {t.end_time}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            <DialogFooter>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit">

                                    {loading
                                        ? "Creating..."
                                        : "Create Schedule"}

                                </Button>

                            </DialogFooter>

                        </form>

                    </DialogContent>

                </Dialog>

            </div>

        </AppLayout>
    )
}