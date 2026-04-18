

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

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'
import Pagination from '@/components/Pagination'
import StatCard from '@/components/StatCard'
interface Program {
    id: number
    program_name: string
}

interface Subject {
    id: number
    program_id: number
    subject_code: string
    subject_name: string
    units: number
    lecture_hours: number
    lab_hours: number
    year_level: number
    semester: number
    program: Program
}

interface Filters {
    program_id?: string
    semester?: string
    year_level?: string
}

const emptyForm = {
    program_id: '',
    subject_code: '',
    subject_name: '',
    subject_type: '',
    hours_per_week: '',
    room_type: '',
    year_level: '',
    semester: '',
    prerequisites: [],

    preferred_teacher: '',
    preferred_day: '',
    preferred_shift: '',

    domain: '' // for minor
}
export default function Index() {

    const { subjects, programs, filters, stats, allSubjects } = usePage().props as unknown as {
        subjects: {
            data: Subject[],
            links: any[]
        },
        programs: Program[],
        filters: Filters
    }

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
    }

    const handleOpenEdit = (subject: any) => {
        setForm({
            program_id: subject.program_id,
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
            subject_type: subject.subject_type,
            hours_per_week: subject.hours_per_week,
            room_type: subject.room_type,
            year_level: subject.year_level,
            semester: subject.semester,

            prerequisites: subject.prerequisites?.map((p: any) => p.id) || [],
        })

        setIsEdit(true)
        setEditId(subject.id)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
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

        // ✅ CLEANUP LOGIC (PUT HERE)
        const payload = {
            ...form,
            program_id: form.subject_type === 'minor' ? null : form.program_id,
            hours_per_week: Number(form.hours_per_week), // ✅ FIX
            year_level: Number(form.year_level),
            semester: Number(form.semester),
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
                                        {program.program_name}
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

                        {/* ROOM TYPE */}
                        <select
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
                        </select>

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
                                    <th className="px-6 py-3 text-left">Room Type</th>
                                    <th className="px-6 py-3 text-left">Prerequisites</th>
                                    <th className="px-6 py-3 text-left">Program</th>
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
                                            {subject.subject_name}
                                        </td>

                                        {/* CODE */}
                                        <td className="px-6 py-4 text-gray-500">
                                            {subject.subject_code}
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                                                {subject.subject_type === 'major' ? 'Major' : 'Minor'}
                                            </span>
                                        </td>

                                        {/* UNIT */}
                                        <td className="px-6 py-4 text-gray-700">
                                            {subject.units ?? subject.hours_per_week ?? 0}
                                        </td>

                                        {/* ROOM TYPE */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full font-medium
                        ${subject.room_type === 'lab'
                                                        ? 'bg-green-100 text-green-700'
                                                        : subject.room_type === 'court'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {subject.room_type === 'lab'
                                                    ? 'Laboratory'
                                                    : subject.room_type === 'court'
                                                        ? 'Court'
                                                        : 'Classroom'}
                                            </span>
                                        </td>

                                        {/* PREREQUISITES */}
                                        <td className="px-6 py-4">
                                            {subject.prerequisites?.length ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {subject.prerequisites.map((pre: any) => (
                                                        <span
                                                            key={pre.id}
                                                            className="px-2 py-1 text-xs bg-gray-200 rounded-full"
                                                        >
                                                            {pre.subject_code}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">None</span>
                                            )}
                                        </td>

                                        {/* PROGRAM */}
                                        <td className="px-6 py-4 text-gray-700">
                                            {subject.program?.program_name ?? 'None'}
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
                    <DialogContent className="max-w-6xl w-full rounded-2xl p-6">

                        {/* HEADER */}
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-xl font-semibold">
                                {isEdit ? "Edit Subject" : "Add New Subject"}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                Create a new subject with scheduling requirements
                            </p>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-5 mt-4">

                            {/* GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                {/* SUBJECT NAME */}
                                <div>
                                    <Label>Subject Name</Label>
                                    <Input
                                        name="subject_name"
                                        value={form.subject_name}
                                        onChange={handleChange}
                                        placeholder="Calculus 1"
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                {/* COURSE CODE */}
                                <div>
                                    <Label>Course Code</Label>
                                    <Input
                                        name="subject_code"
                                        value={form.subject_code}
                                        onChange={handleChange}
                                        placeholder="MATH101"
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                {/* SUBJECT TYPE */}
                                <div>
                                    <Label>Subject Type</Label>
                                    <select
                                        name="subject_type"
                                        value={form.subject_type}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-lg border px-3"
                                    >
                                        <option value="">Minor or Major</option>
                                        <option value="major">Major</option>
                                        <option value="minor">Minor</option>
                                    </select>
                                </div>

                                {/* HOURS */}
                                <div>
                                    <Label>Hours/Week</Label>
                                    <Input
                                        type="number"
                                        name="hours_per_week"
                                        value={form.hours_per_week}
                                        onChange={handleChange}
                                        placeholder="3"
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                {/* YEAR LEVEL */}
                                <div>
                                    <Label>Year Level</Label>
                                    <select
                                        name="year_level"
                                        value={form.year_level}
                                        onChange={handleChange}
                                        className="w-full h-11 border rounded-lg px-3"
                                    >
                                        <option value="">Select year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>

                                {/* SEMESTER */}
                                <div>
                                    <Label>Semester</Label>
                                    <select
                                        name="semester"
                                        value={form.semester}
                                        onChange={handleChange}
                                        className="w-full h-11 border rounded-lg px-3"
                                    >
                                        <option value="">Select semester</option>
                                        <option value="1">1st</option>
                                        <option value="2">2nd</option>
                                        <option value="3">summer</option>
                                    </select>
                                </div>

                                {/* PROGRAM */}
                                {/* PROGRAM (ONLY MAJOR) */}
                                {form.subject_type === 'major' && (
                                    <div className="col-span-3">
                                        <Label>Program</Label>
                                        <select
                                            name="program_id"
                                            value={form.program_id}
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border px-3"
                                        >
                                            <option value="">Select Program</option>
                                            {programs.map((p: any) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.program_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {/* DOMAIN (ONLY MINOR) */}
                                {form.subject_type === 'minor' && (
                                    <div className="col-span-3">
                                        <Label>Domain</Label>
                                        <select
                                            name="domain"
                                            value={form.domain}
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border px-3"
                                        >
                                            <option value="">Select Domain</option>
                                            <option>Computer Science / IT</option>
                                            <option>Business / Management</option>
                                            <option>Tourism / Hospitality</option>
                                            <option>Criminology / Law</option>
                                            <option>General Education</option>
                                            <option>Engineering</option>
                                        </select>
                                    </div>
                                )}

                                {/* PREREQUISITES */}
                                <div className="col-span-2">
                                    <Label>Prerequisites</Label>

                                    <div className="border rounded-lg p-2 flex flex-wrap gap-2 min-h-[44px]">

                                        {/* SELECTED CHIPS */}
                                        {form.prerequisites.map((id: number) => {
                                            const subject = allSubjects.find((s: any) => s.id === id)

                                            return (
                                                <span
                                                    key={id}
                                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                                >
                                                    {subject?.subject_code}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setForm({
                                                                ...form,
                                                                prerequisites: form.prerequisites.filter((p: number) => p !== id)
                                                            })
                                                        }
                                                        className="text-xs hover:text-red-500"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            )
                                        })}

                                        {/* ADD DROPDOWN */}
                                        <select
                                            onChange={(e) => {
                                                const value = Number(e.target.value)

                                                if (!value) return

                                                // prevent duplicates
                                                if (!form.prerequisites.includes(value)) {
                                                    setForm({
                                                        ...form,
                                                        prerequisites: [...form.prerequisites, value]
                                                    })
                                                }

                                                // reset dropdown after select
                                                e.target.value = ""
                                            }}
                                            className="outline-none flex-1 min-w-[150px] bg-transparent text-sm"
                                        >
                                            <option value="">+ Add prerequisite</option>

                                            {allSubjects
                                                .filter((s: any) => s.id !== editId) // prevent self
                                                .map((s: any) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.subject_code} - {s.subject_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ROOM TYPE */}
                                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                    <Label>Required Room Type</Label>
                                    <select
                                        name="room_type"
                                        value={form.room_type}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-lg border px-3"
                                    >
                                        <option value="">Select room type</option>
                                        <option value="classroom">Classroom</option>
                                        <option value="laboratory">Computer Lab</option>
                                        <option value="pe_room">PE Room</option>
                                    </select>
                                </div>

                            </div>

                            {/* ADVANCE OPTION */}
                            <div className="flex items-center gap-2 border-t pt-4">
                                <input
                                    type="checkbox"
                                    checked={isAdvance}
                                    onChange={(e) => setIsAdvance(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <Label className="text-sm">
                                    Advance (If not regular schedule)
                                </Label>
                            </div>

                            {isAdvance && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* TEACHER */}
                                    <div>
                                        <Label>Preferred Teacher</Label>
                                        <Input
                                            name="preferred_teacher"
                                            value={form.preferred_teacher}
                                            onChange={handleChange}
                                            placeholder="Optional"
                                            className="h-11 rounded-lg"
                                        />
                                    </div>

                                    {/* DAY */}
                                    <div>
                                        <Label>Preferred Day</Label>
                                        <select
                                            name="preferred_day"
                                            value={form.preferred_day}
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border px-3"
                                        >
                                            <option value="">Any</option>
                                            <option value="monday">Monday</option>
                                            <option value="tuesday">Tuesday</option>
                                            <option value="wednesday">Wednesday</option>
                                            <option value="thursday">Thursday</option>
                                            <option value="friday">Friday</option>
                                            <option value="saturday">Saturday</option>
                                            <option value="sunday">Sunday</option>
                                        </select>
                                    </div>

                                    {/* SHIFT */}
                                    <div>
                                        <Label>Preferred Shift</Label>
                                        <select
                                            name="preferred_shift"
                                            value={form.preferred_shift}
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border px-3"
                                        >
                                            <option value="">Any</option>
                                            <option value="morning">Morning</option>
                                            <option value="afternoon">Afternoon</option>
                                            <option value="evening">Evening</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* BUTTON */}
                            <Button className="w-full h-12 rounded-xl text-base">
                                {loading
                                    ? (isEdit ? "Saving..." : "Adding...")
                                    : (isEdit ? "Save Changes" : "Add Subject")}
                            </Button>

                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}
