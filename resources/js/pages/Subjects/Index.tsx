

import { Head, router, usePage } from '@inertiajs/react'
import { BarChart3, BookOpen, Clock, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { PROGRAMS_BY_DOMAIN } from '@/constant/programs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'
import Pagination from '@/components/Pagination'
import StatCard from '@/components/StatCard'
interface Program {
    id: number
    name: string
}



interface Subject {
    id: number
    name: string
    code: string
    type: string
    units: number

    program_id?: number
    domain_id?: number

    prerequisite_subject_id?: number

    program?: Program

    prerequisite?: {
        id: number
        code: string
        name: string
    }
    domain?: {
        id: number
        name: string
    }
}
interface Filters {
    program_id?: string
    semester?: string
    year_level?: string
}

const emptyForm = {
    name: '',
    code: '',
    type: '',
    units: '',

    program_id: '',
    prerequisite_subject_id: '',
    domain_id: '',

    pref_day: '',
    pref_shift: '',
    pref_teacher_id: '',
    pref_room_id: '',

    req_day: '',
    req_shift: '',
    req_teacher_id: '',
    req_room_id: '',
}
export default function Index() {

    const {
        subjects,
        programs,
        filters,
        stats,
        allSubjects,
        teachers,
        domains,
        rooms
    } = usePage().props as unknown as {
        subjects: {
            data: Subject[]
            links: any[]
        }

        programs: Program[]

        filters: Filters

        stats: {
            total_subject: number
            total_minor: number
            total_major: number
        }

        allSubjects: Subject[]

        domains: {
            id: number
            name: string
        }[]

        rooms: {
            id: number
            generated_name: string
        }[]

        teachers: {
            id: number
            code: string
            name: string
        }[]
    }
    console.log('teachers:', teachers);

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [isAdvance, setIsAdvance] = useState(false)
    const [search, setSearch] = useState(filters.search || '')

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get('/subject', {
                ...filters,
                search
            }, {
                preserveState: true,
                replace: true
            })
        }, 400)

        return () => clearTimeout(delay)
    }, [search])

    /* -----------------------------
       FILTER HANDLER
    ------------------------------*/
    const handleFilterChange = (key: string, value: string) => {
        router.get('/subject', {
            ...filters,
            [key]: value
        }, {
            preserveState: true,
            replace: true
        })
    }

    /* -----------------------------
       CRUD FUNCTIONS
    ------------------------------*/
    const handleOpen = () => {
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setOpen(true)
        setIsAdvance(false)
    }

    const handleOpenEdit = (subject: any) => {
        setForm({
            name: subject.name || '',
            code: subject.code || '',
            type: subject.type || '',
            units: subject.units || '',

            program_id: subject.program_id || '',
            prerequisite_subject_id: subject.prerequisite_subject_id || '',
            domain_id: subject.domain_id || '',

            pref_day: subject.pref_day || '',
            pref_shift: subject.pref_shift || '',
            pref_teacher_id: subject.pref_teacher_id || '',
            pref_room_id: subject.pref_room_id || '',

            req_day: subject.req_day || '',
            req_shift: subject.req_shift || '',
            req_teacher_id: subject.req_teacher_id || '',
            req_room_id: subject.req_room_id || '',
        })

        setIsEdit(true)
        setEditId(subject.id)
        setOpen(true)
        setIsAdvance(false)
    }

    const handleClose = () => {
        setOpen(false)
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setIsAdvance(false)
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...form,

            units: Number(form.units),

            // Major only
            program_id:
                form.type === 'Major'
                    ? form.program_id || null
                    : null,

            // Minor only
            domain_id:
                form.type === 'Minor'
                    ? form.domain_id || null
                    : null,

            prerequisite_subject_id:
                form.prerequisite_subject_id || null,

            // Preferred
            pref_teacher_id: form.pref_teacher_id || null,
            pref_room_id: form.pref_room_id || null,

            // Required
            req_teacher_id: form.req_teacher_id || null,
            req_room_id: form.req_room_id || null,
        }

        if (isEdit && editId) {
            router.put(`/subject/${editId}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/subject', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        }
    }

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this subject?")) return
        router.delete(`/subject/${id}`, { preserveScroll: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Subjects", href: '/subject' }]}>
            <Head title="Subjects" />

            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <BookOpen className="mr-2 text-blue-600" size={28} />
                        <h1 className="text-2xl font-bold">Manage Subjects</h1>
                    </div>

                    <Button onClick={handleOpen} className="gap-2">
                        <Plus size={18} />
                        Add Subject
                    </Button>
                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <StatCard title="Total Subject" value={stats?.total_subject ?? 0} icon={BookOpen} />
                    <StatCard title="Total Minor" value={stats?.total_minor ?? 0} icon={Clock} />
                    <StatCard title="Total Major" value={stats?.total_major ?? 0} icon={Users} />
                </div>

                {/* ============================
                    FILTER SECTION
                ============================= */}
                <div className="mb-6 border rounded-xl bg-white p-4 shadow-sm">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

                        {/* SEARCH */}
                        <div className="flex-1 w-full">
                            <Input
                                placeholder="Search subjects or course codes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 rounded-lg"
                            />
                        </div>

                        {/* PROGRAM / DEPARTMENT */}
                        <div className="relative w-full md:w-[220px]">

                            <select
                                value={filters.program_id || ''}
                                onChange={(e) =>
                                    handleFilterChange('program_id', e.target.value)
                                }
                                className="w-full h-11 rounded-lg border bg-white px-3 pr-10 text-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   appearance-none cursor-pointer"
                            >
                                <option value="">All Departments</option>
                                {programs.map(program => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>



                            {/* custom arrow */}
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>



                        </div>
                        <select
                            value={filters.subject_type || ''}
                            onChange={(e) =>
                                handleFilterChange('subject_type', e.target.value)
                            }
                            className="h-11 rounded-lg border px-3 w-full md:w-[180px]"
                        >
                            <option value="">All Types</option>
                            <option value="Major">Major</option>
                            <option value="Minor">Minor</option>
                        </select>

                        {/* ROOM TYPE */}
                        {/* <select
                            value={filters.room_type || ''}
                            onChange={(e) =>
                                handleFilterChange('room_type', e.target.value)
                            }
                            className="h-11 rounded-lg border px-3 w-full md:w-[200px]"
                        >
                            <option value="">All Room Types</option>
                            <option value="lecture">Classroom</option>
                            <option value="lab">Laboratory</option>
                            <option value="pe_room">PE Room</option>
                        </select> */}

                    </div>
                </div>

                {/* ============================
                    TABLE
                ============================= */}
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

                    {/* HEADER */}
                    <div className="p-5 border-b">
                        <h2 className="font-semibold text-lg">Course Catalog</h2>
                        <p className="text-sm text-muted-foreground">
                            All subjects with their scheduling requirement and constraints
                        </p>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            {/* HEAD */}
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Subject</th>
                                    <th className="px-6 py-3 text-left">Code</th>
                                    <th className="px-6 py-3 text-left">Type</th>
                                    <th className="px-6 py-3 text-left">Unit</th>

                                    <th className="px-6 py-3 text-left">Prerequisites</th>
                                    <th className="px-6 py-3 text-left">
                                        {filters.subject_type === 'Minor' ? 'Domain' : 'Program'}
                                    </th>
                                    <th className="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>

                            {/* BODY */}
                            <tbody>
                                {subjects.data.length > 0 ? subjects.data.map((subject) => (
                                    <tr
                                        key={subject.id}
                                        className="border-t hover:bg-gray-50 transition"
                                    >

                                        {/* SUBJECT */}
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {subject.name}
                                        </td>

                                        {/* CODE */}
                                        <td className="px-6 py-4 text-gray-500">
                                            {subject.code}
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                                                {subject.type === 'Major' ? 'Major' : 'Minor'}
                                            </span>
                                        </td>

                                        {/* UNIT */}
                                        <td className="px-6 py-4 text-gray-700">
                                            {subject.units ?? 0}
                                        </td>



                                        {/* PREREQUISITES */}
                                        <td className="px-6 py-4">
                                            {subject.prerequisite ? (
                                                <span className="px-2 py-1 text-xs bg-gray-200 rounded-full">
                                                    {subject.prerequisite.code}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">None</span>
                                            )}
                                        </td>

                                        {/* PROGRAM */}
                                        <td className="px-6 py-4 text-gray-700">
                                            {subject.type === 'Minor'
                                                ? subject.domain?.name ?? 'None'
                                                : subject.program?.name ?? 'None'}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">


                                                <button
                                                    onClick={() => handleOpenEdit(subject)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>


                                                <button
                                                    onClick={() => handleDelete(subject.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-6 text-gray-400">
                                            No subjects found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>

                <Pagination links={subjects.links} />

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-6xl w-full rounded-2xl p-6 max-h-[90vh] overflow-y-auto">

                        {/* HEADER */}
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-xl font-semibold">
                                {isEdit ? "Edit Subject" : "Add New Subject"}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                Create a new subject with scheduling requirements
                            </p>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">

                            {/* TOP ROW */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <Label>Subject Name</Label>
                                    <Input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Calculus 1"
                                        className="h-11 rounded-md"
                                    />
                                </div>

                                <div>
                                    <Label>Course Code</Label>
                                    <Input
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        placeholder="MATH101"
                                        className="h-11 rounded-md"
                                    />
                                </div>

                                <div>
                                    <Label>Subject Type</Label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-md border px-3"
                                    >
                                        <option value="">Minor or Major</option>
                                        <option value="Major">Major</option>
                                        <option value="Minor">Minor</option>
                                    </select>
                                </div>

                                <div>
                                    <Label>Hours/Week</Label>
                                    <Input
                                        type="number"
                                        name="units"
                                        value={form.units}
                                        onChange={handleChange}
                                        placeholder="3"
                                        className="h-11 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* PROGRAM */}
                            {form.type === 'Major' && (
                                <div>
                                    <Label>Program</Label>
                                    <select
                                        name="program_id"
                                        value={form.program_id}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-md border px-3"
                                    >
                                        <option value="">*If Major* Select program</option>
                                        {programs.map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {form.type === 'Minor' && (
                                <div>
                                    <Label>Domain</Label>

                                    <select
                                        name="domain_id"
                                        value={form.domain_id}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-md border px-3"
                                    >
                                        <option value="">Select Domain Group</option>

                                        {domains.map((g: any) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* PREREQUISITES */}
                            {/* PREREQUISITE */}
                            {form.type === 'Major' && (
                                <div>
                                    <Label>Prerequisite Subject</Label>

                                    <select
                                        name="prerequisite_subject_id"
                                        value={form.prerequisite_subject_id}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-md border px-3"
                                    >
                                        <option value="">None</option>

                                        {allSubjects.map((s: any) => (
                                            <option key={s.id} value={s.id}>
                                                {s.code} - {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}



                            {/* ROOM TYPE */}
                            {/* <div>
                                <Label>Required Room Type</Label>
                                <select
                                    name="room_type"
                                    value={form.room_type}
                                    onChange={handleChange}
                                    className="w-full h-11 rounded-md border px-3"
                                >
                                    <option value="">Select room type</option>
                                    <option value="classroom">Classroom</option>
                                    <option value="laboratory">Computer Lab</option>
                                    <option value="pe_room">PE Room</option>
                                </select>
                            </div> */}

                            {/* ADVANCED */}
                            <div className="border-t pt-4 mt-2">

                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        checked={isAdvance}
                                        onChange={(e) => setIsAdvance(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <Label className="text-sm">Advance</Label>
                                </div>

                                {isAdvance && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* PREFERRED DAY */}
                                        <div>
                                            <Label>Preferred Day to Schedule</Label>
                                            <select
                                                name="pref_day"
                                                value={form.pref_day}
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-md border px-3"
                                            >
                                                <option value="">Select Day</option>
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                                <option value="Saturday">Saturday</option>
                                                <option value="Sunday">Sunday</option>
                                            </select>
                                        </div>

                                        {/* PREFERRED TEACHER */}
                                        <div>
                                            <Label>Preferred Teacher</Label>
                                            <select
                                                name="pref_teacher_id"
                                                value={form.pref_teacher_id}
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-md border px-3"
                                            >
                                                <option value="">Select Teacher</option>

                                                {teachers.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name} ({t.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* PREFERRED SHIFT */}
                                        <div>
                                            <Label>Preferred Shift</Label>
                                            <select
                                                name="pref_shift"
                                                value={form.pref_shift}
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-md border px-3"
                                            >
                                                <option value="">Select Shift</option>
                                                <option value="Morning">Morning</option>
                                                <option value="Afternoon">Afternoon</option>
                                                <option value="Evening">Evening</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                                            <div>
                                                <Label>Required Day</Label>

                                                <select
                                                    name="req_day"
                                                    value={form.req_day}
                                                    onChange={handleChange}
                                                    className="w-full h-11 rounded-md border px-3"
                                                >
                                                    <option value="">None</option>
                                                    <option value="Monday">Monday</option>
                                                    <option value="Tuesday">Tuesday</option>
                                                    <option value="Wednesday">Wednesday</option>
                                                    <option value="Thursday">Thursday</option>
                                                    <option value="Friday">Friday</option>
                                                    <option value="Saturday">Saturday</option>
                                                </select>
                                            </div>

                                            <div>
                                                <Label>Required Shift</Label>

                                                <select
                                                    name="req_shift"
                                                    value={form.req_shift}
                                                    onChange={handleChange}
                                                    className="w-full h-11 rounded-md border px-3"
                                                >
                                                    <option value="">None</option>
                                                    <option value="Morning">Morning</option>
                                                    <option value="Afternoon">Afternoon</option>
                                                    <option value="Evening">Evening</option>
                                                </select>
                                            </div>

                                        </div>

                                        {/* PREFERRED ROOM */}
                                        <div>
                                            <Label>Preferred Room</Label>
                                            <select
                                                name="pref_room_id"
                                                value={form.pref_room_id}
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-md border px-3"
                                            >
                                                <option value="">Select Room</option>

                                                {rooms.map((r: any) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.generated_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>

                                )}

                            </div>

                            {/* BUTTON */}
                            <Button className="w-full h-12 rounded-lg text-base">
                                {loading ? "Saving..." : "Add Subject"}
                            </Button>

                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}
