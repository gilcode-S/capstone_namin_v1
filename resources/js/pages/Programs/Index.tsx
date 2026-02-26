import { Head, router, usePage } from '@inertiajs/react'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
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

interface Department {
    id: number
    department_name: string
}

interface Program {
    id: number
    department_id: number
    program_code: string
    program_name: string
    department: Department
}

const emptyForm = {
    department_id: '',
    program_code: '',
    program_name: ''
}

export default function Index() {

    const { programs, departments } = usePage().props as unknown as {
        programs: Program[],
        departments: Department[]
    }

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [loading, setLoading] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    // OPEN CREATE
    const handleOpen = () => {
        setForm(emptyForm)
        setOpen(true)
        setIsEdit(false)
        setEditId(null)
    }

    // OPEN EDIT
    const handleOpenEdit = (program: Program) => {
        setForm({
            department_id: program.department_id,
            program_code: program.program_code,
            program_name: program.program_name
        })

        setEditId(program.id)
        setIsEdit(true)
        setOpen(true)
    }

    // CLOSE MODAL
    const handleClose = () => {
        setForm(emptyForm)
        setOpen(false)
        setIsEdit(false)
        setEditId(null)
    }

    // HANDLE CHANGE
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    // SUBMIT
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (isEdit && editId) {
            router.put(`/program/${editId}`, form, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/program', form, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        }
    }

    // DELETE
    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this program?")) return

        router.delete(`/program/${id}`)
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Programs", href: '/program' }]}>
            <Head title="Programs" />

            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Building2 className="mr-2 text-blue-500" size={28} />
                        <h1 className="text-2xl font-bold">Manage Programs</h1>
                    </div>

                    <Button onClick={handleOpen} className="gap-2">
                        <Plus size={18} />
                        Add Program
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
                    <table className="min-w-full bg-white dark:bg-gray-800">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="px-4 py-2 text-left">Department</th>
                                <th className="px-4 py-2 text-left">Code</th>
                                <th className="px-4 py-2 text-left">Program Name</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {programs.length > 0 ? programs.map(program => (
                                <tr key={program.id} className="border-t dark:border-gray-700">
                                    <td className="px-4 py-2">
                                        {program.department.department_name}
                                    </td>
                                    <td className="px-4 py-2">
                                        {program.program_code}
                                    </td>
                                    <td className="px-4 py-2">
                                        {program.program_name}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mr-2"
                                            onClick={() => handleOpenEdit(program)}
                                        >
                                            <Pencil size={16} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(program.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                                        No Programs Found
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
                                {isEdit ? "Edit Program" : "Add Program"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <Label>Department</Label>
                                <select
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Program Code</Label>
                                <Input
                                    name="program_code"
                                    value={form.program_code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label>Program Name</Label>
                                <Input
                                    name="program_name"
                                    value={form.program_name}
                                    onChange={handleChange}
                                    required
                                />
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
                                        ? (isEdit ? "Saving..." : "Adding...")
                                        : (isEdit ? "Save Changes" : "Add Program")}
                                </Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}