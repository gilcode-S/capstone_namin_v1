import { Head, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Program {
    id: number
    program_name: string
    program_code: string
    department_id: number
}

interface Department {
    id: number
    department_name: string
    department_code?: string
    programs: Program[]
}

export default function Index() {

    const { departments } = usePage().props as unknown as {
        departments: Department[]
    }

    // ---------------- STATE ----------------

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({
        department_id: '',
        program_name: '',
        program_code: ''
    })
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    const [deptOpen, setDeptOpen] = useState(false)
    const [deptForm, setDeptForm] = useState({
        department_name: '',
        department_code: ''
    })
    const [deptEditId, setDeptEditId] = useState<number | null>(null)
    const [deptIsEdit, setDeptIsEdit] = useState(false)

    // ---------------- PROGRAM ----------------

    const openAdd = (deptId?: number) => {
        setForm({
            department_id: deptId ? String(deptId) : '',
            program_name: '',
            program_code: ''
        })
        setIsEdit(false)
        setEditId(null)
        setOpen(true)
    }

    const openEdit = (p: Program) => {
        setForm({
            department_id: String(p.department_id),
            program_name: p.program_name,
            program_code: p.program_code
        })
        setEditId(p.id)
        setIsEdit(true)
        setOpen(true)
    }

    const handleProgramSubmit = (e: any) => {
        e.preventDefault()

        if (isEdit && editId) {
            router.put(`/program/${editId}`, form, {
                onSuccess: () => setOpen(false)
            })
        } else {
            router.post('/program', form, {
                onSuccess: () => setOpen(false)
            })
        }
    }

    const deleteProgram = (id: number) => {
        if (!confirm("Delete this program?")) return
        router.delete(`/program/${id}`)
    }

    // ---------------- DEPARTMENT ----------------

    const openDeptAdd = () => {
        setDeptForm({ department_name: '', department_code: '' })
        setDeptIsEdit(false)
        setDeptEditId(null)
        setDeptOpen(true)
    }

    const openDeptEdit = (d: Department) => {
        setDeptForm({
            department_name: d.department_name,
            department_code: d.department_code || ''
        })
        setDeptEditId(d.id)
        setDeptIsEdit(true)
        setDeptOpen(true)
    }

    const handleDeptSubmit = (e: any) => {
        e.preventDefault()

        if (deptIsEdit && deptEditId) {
            router.put(`/department/${deptEditId}`, deptForm, {
                onSuccess: () => setDeptOpen(false)
            })
        } else {
            router.post('/department', deptForm, {
                onSuccess: () => setDeptOpen(false)
            })
        }
    }

    const deleteDept = (id: number) => {
        if (!confirm("Delete this department?")) return
        router.delete(`/department/${id}`)
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Academics", href: "/academics" }]}>
            <Head title="Academics Management" />

            <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold">
                        Department and Program Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage departments and academic programs efficiently.
                    </p>
                </div>

                {/* TOP PANELS */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* DEPARTMENTS */}
                    <div className="border rounded-2xl p-5 bg-white shadow-sm">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold">DEPARTMENT LIST</h2>
                            <Button size="sm" onClick={openDeptAdd}>
                                + Add Department
                            </Button>
                        </div>

                        {departments.map(d => (
                            <div key={d.id} className="flex justify-between items-center border-b py-2">
                                <span>{d.department_name}</span>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" onClick={() => openDeptEdit(d)}>
                                        <Pencil size={14} />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => deleteDept(d.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PROGRAMS */}
                    <div className="border rounded-2xl p-5 bg-white shadow-sm">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold">PROGRAM LIST</h2>
                            <Button size="sm" onClick={() => openAdd()}>
                                + Add Program
                            </Button>
                        </div>

                        {departments.flatMap(d => d.programs).map(p => (
                            <div key={p.id} className="grid grid-cols-3 items-center border-b py-2">
                                <span>{p.program_name}</span>
                                <span className="text-center">{p.program_code}</span>
                                <div className="flex justify-end gap-2">
                                    <Button size="icon" variant="outline" onClick={() => openEdit(p)}>
                                        <Pencil size={14} />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => deleteProgram(p.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GROUPED VIEW */}
                <div className="space-y-6 border-t pt-6">
                    {departments.map(dept => (
                        <div key={dept.id} className="border rounded-2xl p-6 bg-white shadow-sm space-y-3">

                            {/* HEADER */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">
                                    {dept.department_name}
                                </h2>

                                <Button
                                    size="sm"
                                    className="flex items-center gap-1"
                                    onClick={() => openAdd(dept.id)}
                                >
                                    <Plus size={14} />
                                    Add Program
                                </Button>
                            </div>

                            {/* COLUMN HEADER */}
                            <div className="grid grid-cols-3 text-sm font-semibold text-gray-500 border-b pb-2">
                                <div>Program Name</div>
                                <div className="text-center">Code</div>
                                <div className="text-right">Action</div>
                            </div>

                            {/* PROGRAM LIST */}
                            {dept.programs.length > 0 ? (
                                dept.programs.map(p => (
                                    <div
                                        key={p.id}
                                        className="grid grid-cols-3 items-center py-3 border-b hover:bg-gray-50 rounded transition"
                                    >
                                        <div className="font-medium">
                                            {p.program_name}
                                        </div>

                                        <div className="text-center text-gray-600">
                                            {p.program_code}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => openEdit(p)}
                                            >
                                                <Pencil size={14} />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => deleteProgram(p.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-3">
                                    No programs yet
                                </div>
                            )}

                        </div>
                    ))}
                </div>

                {/* PROGRAM MODAL */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? "Edit Program" : "Add Program"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleProgramSubmit} className="space-y-4">

                            <select
                                value={form.department_id}
                                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.department_name}
                                    </option>
                                ))}
                            </select>

                            <Input
                                placeholder="Program Code"
                                value={form.program_code}
                                onChange={(e) => setForm({ ...form, program_code: e.target.value })}
                                required
                            />

                            <Input
                                placeholder="Program Name"
                                value={form.program_name}
                                onChange={(e) => setForm({ ...form, program_name: e.target.value })}
                                required
                            />

                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* DEPARTMENT MODAL */}
                <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{deptIsEdit ? "Edit Department" : "Add Department"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleDeptSubmit} className="space-y-4">

                            <Input
                                placeholder="Department Code"
                                value={deptForm.department_code}
                                onChange={(e) => setDeptForm({ ...deptForm, department_code: e.target.value })}
                                required
                            />

                            <Input
                                placeholder="Department Name"
                                value={deptForm.department_name}
                                onChange={(e) => setDeptForm({ ...deptForm, department_name: e.target.value })}
                                required
                            />

                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}