import { Head, router, usePage } from '@inertiajs/react'
import { Building2, ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react'

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout'

/* ================= TYPES ================= */

interface Program {
    id: number
    program_name: string
    program_code: string
}

interface Department {
    id: number
    department_code: string
    department_name: string
    domain: string
    programs: Program[]
}

const domains = [
    "Computer Science / IT",
    "Business / Management",
    "Tourism / Hospitality",
    "Criminology / Law",
    "General Education",
    "Engineering"
]

/* ================= COMPONENT ================= */

const Index = () => {
    const { departments } = usePage().props as unknown as { departments: Department[] }

    const [openDept, setOpenDept] = useState(false)
    const [openProgram, setOpenProgram] = useState(false)
    const [expanded, setExpanded] = useState<number[]>([])

    const [selectedDept, setSelectedDept] = useState<number | null>(null)

    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    const [deptForm, setDeptForm] = useState({
        department_code: '',
        department_name: '',
        domain: ''
    })

    const [programForm, setProgramForm] = useState({
        program_name: '',
        program_code: '',
        department_id: ''
    })

    const [loading, setLoading] = useState(false)

    /* ================= HANDLERS ================= */

    const toggleExpand = (id: number) => {
        setExpanded(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleDeptChange = (e: any) => {
        setDeptForm({ ...deptForm, [e.target.name]: e.target.value })
    }

    const handleProgramChange = (e: any) => {
        setProgramForm({ ...programForm, [e.target.name]: e.target.value })
    }

    const handleEditDept = (dept: Department) => {
        setDeptForm({
            department_code: dept.department_code,
            department_name: dept.department_name,
            domain: dept.domain
        })

        setEditId(dept.id)
        setIsEdit(true)
        setOpenDept(true)
    }

    const resetDept = () => {
        setOpenDept(false)
        setIsEdit(false)
        setEditId(null)

        setDeptForm({
            department_code: '',
            department_name: '',
            domain: ''
        })
    }

    /* ================= SUBMIT ================= */

    const submitDepartment = (e: any) => {
        e.preventDefault()
        setLoading(true)

        if (isEdit && editId) {
            router.put(`/department/${editId}`, deptForm, {
                onSuccess: () => {
                    setLoading(false)
                    resetDept()
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/department', deptForm, {
                onSuccess: () => {
                    setLoading(false)
                    resetDept()
                },
                onError: () => setLoading(false)
            })
        }
    }

    const submitProgram = (e: any) => {
        e.preventDefault()
        setLoading(true)

        router.post('/program', programForm, {
            onSuccess: () => {
                setLoading(false)
                setOpenProgram(false)
                setProgramForm({
                    program_name: '',
                    program_code: '',
                    department_id: ''
                })
            },
            onError: () => setLoading(false)
        })
    }

    /* ================= DELETE ================= */

    const deleteDepartment = (id: number) => {
        if (!confirm("Delete this department?")) return
        router.delete(`/department/${id}`)
    }

    const deleteProgram = (id: number) => {
        if (!confirm("Delete this program?")) return
        router.delete(`/program/${id}`)
    }

    /* ================= UI ================= */

    return (
        <AppLayout breadcrumbs={[{ title: "Academic Structure", href: '/academics' }]}>
            <Head title="Academic Structure" />

            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Building2 className='mr-2 text-blue-500' size={30} />
                        <div>
                            <h1 className='text-2xl font-bold'>Academic Structure</h1>
                            <p className="text-sm text-gray-500">Manage departments and programs</p>
                        </div>
                    </div>

                    <Button onClick={() => setOpenDept(true)} className='gap-2'>
                        <Plus size={16} />
                        Add Department
                    </Button>
                </div>

                {/* EMPTY STATE */}
                {departments.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        No departments yet. Start by adding one 🚀
                    </div>
                )}

                {/* LIST */}
                <div className="space-y-4">
                    {departments.map((dept) => (
                        <div key={dept.id} className="border rounded-xl bg-white dark:bg-gray-800 shadow-sm">

                            {/* HEADER */}
                            <div className="flex justify-between items-center p-4">

                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(dept.id)}>
                                    {expanded.includes(dept.id)
                                        ? <ChevronDown size={18} />
                                        : <ChevronRight size={18} />
                                    }

                                    <div>
                                        <h2 className="font-semibold">{dept.department_name}</h2>
                                        <p className="text-xs text-gray-500">{dept.domain_category}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditDept(dept)}>
                                        <Pencil size={14} />
                                    </Button>

                                    <Button size="sm" variant="destructive" onClick={() => deleteDepartment(dept.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            {/* EXPANDED */}
                            {expanded.includes(dept.id) && (
                                <div className="px-4 pb-4 border-t">

                                    {/* PROGRAMS */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {dept.programs?.length > 0 ? (
                                            dept.programs.map((prog) => (
                                                <div
                                                    key={prog.id}
                                                    className="group flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900"
                                                >
                                                    {prog.program_code}

                                                    <button
                                                        title="Delete program"
                                                        onClick={() => deleteProgram(prog.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400">No programs</p>
                                        )}
                                    </div>

                                    {/* ADD PROGRAM */}
                                    <div className="mt-3">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                setSelectedDept(dept.id)
                                                setProgramForm({
                                                    ...programForm,
                                                    department_id: dept.id.toString()
                                                })
                                                setOpenProgram(true)
                                            }}
                                        >
                                            + Add Program
                                        </Button>
                                    </div>

                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ADD / EDIT DEPARTMENT */}
                <Dialog open={openDept} onOpenChange={setOpenDept}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? "Edit Department" : "Add Department"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitDepartment} className="space-y-4">

                            <div>
                                <Label>Department Code</Label>
                                <Input name="department_code" value={deptForm.department_code} onChange={handleDeptChange} required />
                            </div>

                            <div>
                                <Label>Department Name</Label>
                                <Input name="department_name" value={deptForm.department_name} onChange={handleDeptChange} required />
                            </div>

                            <div>
                                <Label>Domain Category</Label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    name="domain"
                                    value={deptForm.domain}
                                    onChange={handleDeptChange}
                                    required
                                >
                                    <option value="">Select Domain</option>
                                    {domains.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={resetDept}>
                                    Cancel
                                </Button>

                                <Button type="submit">
                                    {loading
                                        ? "Saving..."
                                        : isEdit
                                            ? "Update Department"
                                            : "Save"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ADD PROGRAM */}
                <Dialog open={openProgram} onOpenChange={setOpenProgram}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Program</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitProgram} className="space-y-4">

                            <div>
                                <Label>Program Name</Label>
                                <Input name="program_name" value={programForm.program_name} onChange={handleProgramChange} required />
                            </div>

                            <div>
                                <Label>Program Code</Label>
                                <Input name="program_code" value={programForm.program_code} onChange={handleProgramChange} required />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpenProgram(false)}>
                                    Cancel
                                </Button>

                                <Button type="submit">
                                    {loading ? "Saving..." : "Save Program"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}

export default Index