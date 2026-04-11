

import { Head, router, usePage } from '@inertiajs/react'
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

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

    const { subjects, programs, filters } = usePage().props as unknown as {
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

                {/* ============================
                    FILTER SECTION
                ============================= */}
                <div className="mb-6 flex gap-4 flex-wrap">

                    <select
                        value={filters.program_id || ''}
                        onChange={(e) =>
                            handleFilterChange('program_id', e.target.value)
                        }
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Programs</option>
                        {programs.map(program => (
                            <option key={program.id} value={program.id}>
                                {program.program_name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.semester || ''}
                        onChange={(e) =>
                            handleFilterChange('semester', e.target.value)
                        }
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Semesters</option>
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                    </select>

                    <select
                        value={filters.year_level || ''}
                        onChange={(e) =>
                            handleFilterChange('year_level', e.target.value)
                        }
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Year Levels</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>

                </div>

                {/* ============================
                    TABLE
                ============================= */}
                <div className="overflow-x-auto rounded-lg shadow border">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2">Program</th>
                                <th className="px-4 py-2">Code</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Units</th>
                                <th className="px-4 py-2">Lecture</th>
                                <th className="px-4 py-2">Lab</th>
                                <th className="px-4 py-2">Year</th>
                                <th className="px-4 py-2">Sem</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {subjects.data.length > 0 ? subjects.data.map(subject => (
                                <tr key={subject.id} className="border-t">
                                    <td className="px-4 py-2">
                                        {subject.program.program_name}
                                    </td>
                                    <td className="px-4 py-2">{subject.subject_code}</td>
                                    <td className="px-4 py-2">{subject.subject_name}</td>
                                    <td className="px-4 py-2">{subject.units}</td>
                                    <td className="px-4 py-2">{subject.lecture_hours}</td>
                                    <td className="px-4 py-2">{subject.lab_hours}</td>
                                    <td className="px-4 py-2">{subject.year_level}</td>
                                    <td className="px-4 py-2">{subject.semester}</td>
                                    <td className="px-4 py-2 text-center">
                                        <Button size="sm" variant="outline"
                                            className="mr-2"
                                            onClick={() => handleOpenEdit(subject)}>
                                            <Pencil size={16} />
                                        </Button>

                                        <Button size="sm" variant="destructive"
                                            onClick={() => handleDelete(subject.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>

                            )) : (
                                <tr>
                                    <td colSpan={9}
                                        className="text-center py-4 text-gray-500">
                                        No subjects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
