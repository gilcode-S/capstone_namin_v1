import { Head, router, usePage } from '@inertiajs/react'

import { Plus, Pencil, Trash2, Calendar } from 'lucide-react'
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


interface Semester {
    id: number
    school_year: string
    term: string
    start_date: string
    end_date: string
    status: string
}

const emptyForm = {
    school_year: '',
    term: '',
    start_date: '',
    end_date: '',
    status: 'upcoming'
}

export default function Index() {
    const { semesters } = usePage().props as unknown as {
        semesters: Semester[]
    }

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [loading, setLoading] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    /* OPEN CREATE */
    const handleOpen = () => {
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setOpen(true)
    }

    /* OPEN EDIT */
    const handleOpenEdit = (semester: Semester) => {
        setForm({
            school_year: semester.school_year,
            term: semester.term,
            start_date: semester.start_date,
            end_date: semester.end_date,
            status: semester.status
        })

        setIsEdit(true)
        setEditId(semester.id)
        setOpen(true)
    }

    /* CLOSE */
    const handleClose = () => {
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setOpen(false)
    }

    /* INPUT CHANGE */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    /* SUBMIT */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (form.start_date >= form.end_date) {
            alert('End date must be after start date.')
            return
        }

        setLoading(true)

        if (isEdit && editId) {
            router.put(`/semesters/${editId}`, form, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/semesters', form, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        }
    }

    /* DELETE */
    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this semester?')) return
        router.delete(`/semesters/${id}`)
    }

    /* STATUS COLOR */
    const statusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600'
            case 'completed':
                return 'text-gray-600'
            default:
                return 'text-yellow-600'
        }
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Semesters', href: '/semesters' }]}>
            <Head title="Semester Management" />

            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Calendar className="mr-2 text-blue-500" size={28} />
                        <h1 className="text-2xl font-bold">Manage Semesters</h1>
                    </div>

                    <Button onClick={handleOpen} className="gap-2">
                        <Plus size={18} />
                        Add Semester
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto rounded-lg shadow border">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">School Year</th>
                                <th className="px-4 py-2 text-left">Term</th>
                                <th className="px-4 py-2 text-left">Start</th>
                                <th className="px-4 py-2 text-left">End</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {semesters.length > 0 ? semesters.map(s => (
                                <tr key={s.id} className="border-t">
                                    <td className="px-4 py-2">{s.school_year}</td>
                                    <td className="px-4 py-2 capitalize">{s.term}</td>
                                    <td className="px-4 py-2">{s.start_date}</td>
                                    <td className="px-4 py-2">{s.end_date}</td>
                                    <td className="px-4 py-2">
                                        <span className={statusColor(s.status)}>
                                            {s.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mr-2"
                                            onClick={() => handleOpenEdit(s)}
                                        >
                                            <Pencil size={16} />
                                        </Button>

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
                                    <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                                        No Semesters Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? 'Edit Semester' : 'Add Semester'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <Input
                                name="school_year"
                                placeholder="School Year (ex: 2025-2026)"
                                value={form.school_year}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <Label>Term</Label>
                                <select
                                    name="term"
                                    value={form.term}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Term</option>
                                    <option value="1st">1st Semester</option>
                                    <option value="2nd">2nd Semester</option>
                                    <option value="summer">Summer</option>
                                </select>
                            </div>

                            <Input
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <Label>Status</Label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit">
                                    {loading
                                        ? (isEdit ? 'Saving...' : 'Adding...')
                                        : (isEdit ? 'Save Changes' : 'Add Semester')}
                                </Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}