import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Trash2, Pencil, ClipboardList } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
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
            assignments: Assignment[],
            sections: Section[],
            subjects: Subject[],
            faculties: Faculty[],
            versions: Version[]
        }

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
            schedule_version_id: a.version.id,
            section_id: a.section.id,
            subject_id: a.subject.id,
            faculty_id: a.faculty.id
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

                    <Button onClick={handleOpen} className="gap-2">
                        <Plus size={18} />
                        Add Assignment
                    </Button>
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

                            {assignments.length > 0 ? assignments.map(a => (

                                <tr key={a.id} className="border-t">

                                    <td className="px-4 py-2">
                                        {a.version.version_number}
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

                {/* MODAL */}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>

                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? "Edit Assignment" : "Add Assignment"}
                            </DialogTitle>
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
                                            {v.semester.school_year} | {v.semester.term} | Version {v.version_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* SECTION */}

                            <div>
                                <Label>Section</Label>
                                <select
                                    name="section_id"
                                    value={form.section_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.section_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* SUBJECT */}

                            <div>
                                <Label>Subject</Label>
                                <select
                                    name="subject_id"
                                    value={form.subject_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.subject_code} — {s.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* FACULTY */}

                            <div>
                                <Label>Faculty</Label>
                                <select
                                    name="faculty_id"
                                    value={form.faculty_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Faculty</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.first_name} {f.last_name}
                                        </option>
                                    ))}
                                </select>
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