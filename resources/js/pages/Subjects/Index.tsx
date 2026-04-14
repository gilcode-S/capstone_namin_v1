

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
}
export default function Index() {

    const { subjects, programs, filters, stats } = usePage().props as unknown as {
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

        if (isEdit && editId) {
            router.put(`/subject/${editId}`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/subject', form, {
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



                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatCard title="Total Subjects" value={stats?.total_subject ?? 0} icon={BookOpen} />
                    <StatCard title="Total Credits" value={stats?.total_credits ?? 0} icon={BarChart3} />
                    <StatCard title="Weekly Hours" value={stats?.total_weeklyHours ?? 0} icon={Clock} />
                    <StatCard title="Total Students" value={stats?.total_students ?? 0} icon={Users} />
                    <StatCard title="Avg. Capacity" value={`${stats?.avg_capacity ?? 0}%`} icon={BarChart3} />
                </div>

                {/* ============================
                    FILTER SECTION
                ============================= */}
                <div className="mb-6 border rounded-xl bg-white p-4 shadow-sm">

                    <div className="flex flex-col md:flex-row gap-4 items-center">

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
                            <thead className="bg-gray-50 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 text-left">Subject</th>
                                    <th className="px-6 py-3 text-left">Code</th>
                                    <th className="px-6 py-3 text-left">Department</th>
                                    <th className="px-6 py-3 text-left">Hours</th>
                                    <th className="px-6 py-3 text-left">Room Type</th>
                                    {/* <th className="px-6 py-3 text-left">Prerequisites</th> */}
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>

                            {/* BODY */}
                            <tbody>
                                {subjects.data.length > 0 ? subjects.data.map((subject) => (
                                    <tr
                                        key={subject.id}
                                        className="border-t hover:bg-gray-50 group transition"
                                    >

                                        {/* SUBJECT */}
                                        <td className="px-6 py-4 font-medium">
                                            {subject.subject_name}
                                        </td>

                                        {/* CODE */}
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {subject.subject_code}
                                        </td>

                                        {/* DEPARTMENT */}
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                                                {subject.program?.program_name}
                                            </span>
                                        </td>

                                        {/* HOURS */}
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {subject.hours_per_week ?? subject.lecture_hours}h/week
                                        </td>

                                        {/* ROOM TYPE */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full font-medium
                                    ${subject.room_type === 'lab'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {subject.room_type === 'lab'
                                                    ? 'Laboratory'
                                                    : 'Classroom'}
                                            </span>
                                        </td>

                                        {/* PREREQUISITES */}
                                        {/* <td className="px-6 py-4">
                            {subject.prerequisites?.length ? (
                                <div className="flex flex-wrap gap-1">
                                    {subject.prerequisites.map((pre: any, i: number) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                                        >
                                            {pre}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground">
                                    None
                                </span>
                            )}
                        </td> */}

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition">

                                                {/* EDIT */}
                                                <button
                                                    onClick={() => handleOpenEdit(subject)}
                                                    className="p-2 rounded-md hover:bg-gray-100"
                                                >
                                                    <Pencil size={16} className="text-gray-600" />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    onClick={() => handleDelete(subject.id)}
                                                    className="p-2 rounded-md hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-6 text-gray-500">
                                            No subjects found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>

                <Pagination links={subjects.links} />

                {/* ============================
                    MODAL
                ============================= */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-2xl rounded-2xl p-6">

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

                            <div className="grid grid-cols-2 gap-4">

                                {/* SUBJECT NAME */}
                                <div>
                                    <Label>Subject Name</Label>
                                    <Input
                                        name="subject_name"
                                        value={form.subject_name}
                                        onChange={handleChange}
                                        placeholder="Computer Programming"
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                {/* SUBJECT CODE */}
                                <div>
                                    <Label>Course Code</Label>
                                    <Input
                                        name="subject_code"
                                        value={form.subject_code}
                                        onChange={handleChange}
                                        placeholder="CS101"
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                {/* PROGRAM */}
                                <div>
                                    <Label>Program</Label>
                                    <select
                                        name="program_id"
                                        value={form.program_id}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-lg border px-3"
                                    >
                                        <option value="">Select program</option>
                                        {programs.map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.program_name}
                                            </option>
                                        ))}
                                    </select>
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
                                        <option value="">Select type</option>
                                        <option value="major">Major</option>
                                        <option value="minor">Minor</option>
                                    </select>
                                </div>

                                {/* HOURS PER WEEK */}
                                <div>
                                    <Label>Hours / Week</Label>
                                    <Input
                                        type="number"
                                        name="hours_per_week"
                                        value={form.hours_per_week}
                                        onChange={handleChange}
                                        placeholder="3"
                                        className="h-11 rounded-lg"
                                    />
                                </div>

                                {/* ROOM TYPE */}
                                <div>
                                    <Label>Room Type</Label>
                                    <select
                                        name="room_type"
                                        value={form.room_type}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-lg border px-3"
                                    >
                                        <option value="">Select room</option>
                                        <option value="lecture">Lecture</option>
                                        <option value="lab">Laboratory</option>
                                    </select>
                                </div>

                                {/* YEAR LEVEL */}
                                <div>
                                    <Label>Year Level</Label>
                                    <select
                                        name="year_level"
                                        value={form.year_level}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-lg border px-3"
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
                                        className="w-full h-11 rounded-lg border px-3"
                                    >
                                        <option value="">Select semester</option>
                                        <option value="1">1st</option>
                                        <option value="2">2nd</option>
                                    </select>
                                </div>

                            </div>

                            {/* BUTTON */}
                            <Button className="w-full h-11 rounded-lg text-base">
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
