import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Trash2, CalendarDays, LayoutGrid, List } from 'lucide-react'
import { useState } from 'react'
import TimetableGrid from '@/components/TimetableGrid'
import { Button } from '@/components/ui/button'
import ComboBox from '@/components/ui/combobox'


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
    program: Program
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
interface Department {
    id: number
    department_name: string
}
interface Program {
    id: number
    program_name: string
    department_id: number
}

const emptyForm = {
    schedule_version_id: '',
    assignment_id: '',
    room_id: '',
    time_slot_id: ''
}

export default function Index() {

    const { schedules, assignments, rooms, timeslots, versions, sections, faculty, departments, programs } =
        usePage().props as unknown as {
            schedules: Schedule[],
            assignments: Assignment[],
            rooms: Room[],
            timeslots: Timeslot[],
            versions: Version[],
            sections: Section[],
            faculty: Faculty[],
            departments: Department[],
            programs: Program[]
        }

    const [view, setView] = useState<'timetable' | 'table'>('timetable')

    const assignmentOptions = assignments.map(a => ({
        value: String(a.id),
        label: `${a.section.section_name} — ${a.subject.subject_code} — ${a.faculty.first_name}`
    }))

    const roomOptions = rooms.map(r => ({
        value: String(r.id),
        label: r.room_name
    }))

    const timeslotOptions = timeslots.map(t => ({
        value: String(t.id),
        label: `${t.day_of_week} ${t.start_time} - ${t.end_time}`
    }))

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [loading, setLoading] = useState(false)
    // 
    const [departmentId, setDepartmentId] = useState<number | null>(null)
    const [programId, setProgramId] = useState<number | null>(null)
    const [sectionId, setSectionId] = useState<number | null>(null)
    const [facultyId, setFacultyId] = useState<number | null>(null)
    const [roomId, setRoomId] = useState<number | null>(null)

    const filteredSchedules = schedules.filter((s) => {
        const dept = s.assignment?.section?.program?.department_id
        const prog = s.assignment?.section?.program?.id
        const sec = s.assignment?.section?.id
        const fac = s.assignment?.faculty?.id
        const rm = s.room?.id

        if (departmentId && dept !== departmentId) return false
        if (programId && prog !== programId) return false
        if (sectionId && sec !== sectionId) return false
        if (facultyId && fac !== facultyId) return false
        if (roomId && rm !== roomId) return false

        return true
    })

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

                    <div className="flex items-center gap-3">

                        <Button onClick={handleOpen} className="gap-2">
                            <Plus size={18} />
                            Add Schedule
                        </Button>


                    </div>

                </div>

                {/* VIEW SWITCH */}

                <div className="flex gap-2 mb-6">

                    <Button
                        variant={view === 'timetable' ? 'default' : 'outline'}
                        onClick={() => setView('timetable')}
                        className="flex items-center gap-2"
                    >
                        <LayoutGrid size={16} />
                        Timetable
                    </Button>

                    <Button
                        variant={view === 'table' ? 'default' : 'outline'}
                        onClick={() => setView('table')}
                        className="flex items-center gap-2"
                    >
                        <List size={16} />
                        Table
                    </Button>

                </div>
                <div className="flex gap-4 mb-6 flex-wrap">

                    {/* Department */}

                    <select
                        className="border rounded px-3 py-2"
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null
                            setDepartmentId(value)
                            setProgramId(null)
                            setSectionId(null)
                        }}
                    >

                        <option value="">All Departments</option>

                        {departments.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.department_name}
                            </option>
                        ))}

                    </select>


                    {/* Program */}

                    <select
                        className="border rounded px-3 py-2"
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null
                            setProgramId(value)
                            setSectionId(null)
                        }}
                    >

                        <option value="">All Programs</option>

                        {programs
                            .filter(p => !departmentId || p.department_id === departmentId)
                            .map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.program_name}
                                </option>
                            ))}

                    </select>


                    {/* Section */}

                    <select
                        className="border rounded px-3 py-2"
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null
                            setSectionId(value)
                        }}
                    >

                        <option value="">All Sections</option>

                        {sections
                            .filter(s => !programId || s.program?.id === programId)
                            .map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.section_name}
                                </option>
                            ))}

                    </select>
                    <select
                        className="border rounded px-3 py-2"
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null
                            setFacultyId(value)
                        }}
                    >
                        <option value="">All Faculty</option>
                        {faculty.map(f => (
                            <option key={f.id} value={f.id}>
                                {f.first_name} {f.last_name}
                            </option>
                        ))}
                    </select>

                    {/* Room Filter */}
                    <select
                        className="border rounded px-3 py-2"
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null
                            setRoomId(value)
                        }}
                    >
                        <option value="">All Rooms</option>
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.room_name}
                            </option>
                        ))}
                    </select>

                </div>
                {/* TIMETABLE VIEW */}

                {view === 'timetable' && (
                    <TimetableGrid
                        schedules={filteredSchedules}
                        timeslots={timeslots}
                    />
                )}

                {/* TABLE VIEW */}

                {view === 'table' && (

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

                                {filteredSchedules.length > 0 ? filteredSchedules.map(s => (

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

                )}

                {/* CREATE MODAL */}

                <Dialog open={open} onOpenChange={setOpen}>

                    <DialogContent>

                        <DialogHeader>
                            <DialogTitle>Create Schedule</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">

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
                                            SY {v.semester.school_year} | {v.semester.term} | Version {v.version_number}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            <div>
                                <Label>Assignment</Label>
                                <ComboBox
                                    items={assignmentOptions}
                                    value={form.assignment_id}
                                    placeholder="Select Assignment"
                                    onChange={(value) => setForm({ ...form, assignment_id: value })}
                                />
                            </div>

                            <div>
                                <Label>Room</Label>
                                <ComboBox
                                    items={roomOptions}
                                    value={form.room_id}
                                    placeholder="Select Room"
                                    onChange={(value) => setForm({ ...form, room_id: value })}
                                />
                            </div>

                            <div>
                                <Label>Time Slot</Label>
                                <ComboBox
                                    items={timeslotOptions}
                                    value={form.time_slot_id}
                                    placeholder="Select Time Slot"
                                    onChange={(value) => setForm({ ...form, time_slot_id: value })}
                                />
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
                                    {loading ? "Creating..." : "Create Schedule"}
                                </Button>

                            </DialogFooter>

                        </form>

                    </DialogContent>

                </Dialog>

            </div>

        </AppLayout>
    )
}