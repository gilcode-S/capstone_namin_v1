import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Trash2, Pencil, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import ComboBox from "@/components/ui/combobox"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    version: Version
}

const emptyForm = {
    schedule_version_id: '',
    section_id: '',
    subject_id: '',
    faculty_id: ''
}

export default function Index() {

    const { assignments, sections, subjects, faculties, versions } =
        usePage().props as unknown as {
            assignments: {
                data: Assignment[],
                links: any[],
            },
            sections: Section[],
            subjects: Subject[],
            faculties: Faculty[],
            versions: Version[]
        }
    const subjectOptions = subjects.map((s) => ({
        value: String(s.id),
        label: `${s.subject_code} — ${s.subject_name}`
    }))

    const facultyOptions = faculties.map((f) => ({
        value: String(f.id),
        label: `${f.first_name} ${f.last_name}`
    }))
    const sectionOptions = sections.map((s) => ({
        value: String(s.id),
        label: `${s.section_name}`
    }))

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [loading, setLoading] = useState(false)

    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    /* --------------------------
    OPEN CREATE
    ---------------------------*/

    const handleOpen = () => {
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setOpen(true)
    }

    /* --------------------------
    OPEN EDIT
    ---------------------------*/

    const handleOpenEdit = (a: Assignment) => {

        setForm({
            schedule_version_id: String(a.version.id),
            section_id: String(a.section.id),
            subject_id: String(a.subject.id),
            faculty_id: String(a.faculty.id)
        })


        setIsEdit(true)
        setEditId(a.id)
        setOpen(true)
    }

    /* --------------------------
    INPUT CHANGE
    ---------------------------*/

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    /* --------------------------
    CLOSE
    ---------------------------*/

    const handleClose = () => {
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setOpen(false)
    }

    /* --------------------------
    SUBMIT
    ---------------------------*/

    const handleSubmit = (e: any) => {
        e.preventDefault()
        setLoading(true)

        if (isEdit && editId) {
            router.put(`/assignments/${editId}`, form, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                }
            })
        } else {
            router.post('/assignments', form, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                }
            })
        }
    }

    /* --------------------------
    DELETE
    ---------------------------*/

    const handleDelete = (id: number) => {
        if (!confirm("Delete this assignment?")) return
        router.delete(`/assignments/${id}`)
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Assignments", href: "/assignments" }]}>
            <Head title="Assignments" />

            <div className="p-6">

                {/* HEADER */}

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <ClipboardList className="mr-2 text-indigo-500" size={28} />
                        <h1 className="text-2xl font-bold">
                            Section Subject Assignment
                        </h1>
                    </div>

                    <div className='flex items-center justify-center gap-2'>

                        <Button
                            
                            onClick={() => {
                                if (!confirm("Auto assign all subjects for this section?")) return

                                router.post('/assignments/auto-assign', {
                                    schedule_version_id: form.schedule_version_id,
                                    section_id: form.section_id
                                })
                            }}
                        >
                            ⚡ Auto Assign All
                        </Button>

                        <Button onClick={handleOpen} className="gap-2">
                            <Plus size={18} />
                            Add Assignment
                        </Button>
                    </div>


                </div>

                {/* TABLE */}

                <div className="overflow-x-auto rounded-lg shadow border">
                    <table className="min-w-full">

                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Version</th>
                                <th className="px-4 py-2 text-left">Section</th>
                                <th className="px-4 py-2 text-left">Subject</th>
                                <th className="px-4 py-2 text-left">Faculty</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {assignments.data.length > 0 ? assignments.data.map(a => (

                                <tr key={a.id} className="border-t">

                                    <td className="px-4 py-2">
                                        <div className="font-semibold">
                                            Version {a.version.version_number}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            SY {a.version.semester.school_year} • {a.version.semester.term}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2">
                                        {a.section.section_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {a.subject.subject_code} — {a.subject.subject_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {a.faculty.first_name} {a.faculty.last_name}
                                    </td>

                                    <td className="px-4 py-2 text-center">

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mr-2"
                                            onClick={() => handleOpenEdit(a)}
                                        >
                                            <Pencil size={16} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(a.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>

                                    </td>

                                </tr>

                            )) : (

                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        No assignments yet
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>
                </div>
                <Pagination links={assignments.links} />
                {/* MODAL */}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-h-[80vh] overflow-y-auto" >

                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? "Edit Assignment" : "Add Assignment"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* VERSION */}

                            <div>
                                <Label>Schedule Version</Label>
                                <Select
                                    value={String(form.schedule_version_id)}
                                    onValueChange={(value) =>
                                        setForm({ ...form, schedule_version_id: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Version" />
                                    </SelectTrigger>

                                    <SelectContent className="max-h-60">
                                        {versions.map((v) => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.semester.school_year} | {v.semester.term} | Version {v.version_number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* SECTION */}

                            <div>
                                <Label>Section</Label>

                                <ComboBox
                                    items={sectionOptions}
                                    value={form.section_id}
                                    placeholder="Select Section"
                                    onChange={(value) =>
                                        setForm({ ...form, section_id: value })
                                    }
                                />
                            </div>
                            {/* SUBJECT */}

                            <div>
                                <Label>Subject</Label>

                                <ComboBox
                                    items={subjectOptions}
                                    value={form.subject_id}
                                    placeholder="Select Subject"
                                    onChange={(value) =>
                                        setForm({ ...form, subject_id: value })
                                    }
                                />

                            </div>

                            {/* FACULTY */}

                            <div>
                                <Label>Faculty (Optional)</Label>

                                <ComboBox
                                    items={facultyOptions}
                                    value={form.faculty_id}
                                    placeholder="Select Faculty"
                                    onChange={(value) =>
                                        setForm({ ...form, faculty_id: value })
                                    }
                                />

                                <p className="text-xs text-gray-500">
                                    Leave blank for auto-assignment
                                </p>

                            </div>

                            <DialogFooter>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit">

                                    {loading
                                        ? (isEdit ? "Saving..." : "Adding...")
                                        : (isEdit ? "Save Changes" : "Add Assignment")}

                                </Button>

                            </DialogFooter>

                        </form>

                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}