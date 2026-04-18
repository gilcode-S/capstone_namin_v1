import { Head, router, usePage } from '@inertiajs/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

/* ================= PAGE ================= */

const Index = () => {
    const { departments } = usePage().props as { departments: Department[] }

    /* ================= STATES ================= */

    const [openDept, setOpenDept] = useState(false)
    const [openProgram, setOpenProgram] = useState(false)

    const [isEditDept, setIsEditDept] = useState(false)
    const [editDeptId, setEditDeptId] = useState<number | null>(null)

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

    /* ================= PROGRAM INLINE EDIT ================= */

    const [editingProgramId, setEditingProgramId] = useState<number | null>(null)

    const [programEditForm, setProgramEditForm] = useState({
        program_name: '',
        program_code: ''
    })

    /* ================= ACTIONS ================= */

    const handleEditDept = (dept: Department) => {
        setDeptForm({
            department_code: dept.department_code,
            department_name: dept.department_name.replace(" Department", ""),
            domain: dept.domain
        })

        setEditDeptId(dept.id)
        setIsEditDept(true)
        setOpenDept(true)
    }

    const deleteDepartment = (id: number) => {
        if (!confirm("Delete this department?")) return
        router.delete(`/department/${id}`)
    }

    const deleteProgram = (id: number) => {
        if (!confirm("Delete this program?")) return
        router.delete(`/program/${id}`)
    }

    const submitDepartment = (e: any) => {
        e.preventDefault()

        const payload = {
            ...deptForm,
            department_name: deptForm.department_name + " Department"
        }

        if (isEditDept && editDeptId) {
            router.put(`/department/${editDeptId}`, payload, {
                onSuccess: resetDept
            })
        } else {
            router.post('/department', payload, {
                onSuccess: resetDept
            })
        }
    }

    const submitProgram = (e: any) => {
        e.preventDefault()

        if (!programForm.department_id) {
            alert("Select department first")
            return
        }

        router.post('/program', programForm, {
            onSuccess: () => {
                setOpenProgram(false)
                setProgramForm({
                    program_name: '',
                    program_code: '',
                    department_id: ''
                })
            }
        })
    }

    const resetDept = () => {
        setOpenDept(false)
        setIsEditDept(false)
        setEditDeptId(null)
        setDeptForm({
            department_code: '',
            department_name: '',
            domain: ''
        })
    }

    /* ================= UI ================= */

    return (
        <AppLayout breadcrumbs={[{ title: "Academic Structure", href: '/academics' }]}>
            <Head title="Academic Structure" />

            {/* CENTER WRAPPER */}
            <div className="max-w-6xl mx-auto p-6 space-y-10">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold">Department & Program Management</h1>
                    <p className="text-sm text-gray-500">
                        Manage academic structure efficiently
                    </p>
                </div>

                {/* ================= TOP TABLES ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* DEPARTMENTS */}
                    <div className="border rounded-xl bg-white p-4 shadow-sm">

                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold">Departments</h2>
                            <Button size="sm" onClick={() => setOpenDept(true)}>
                                <Plus size={14} /> Add
                            </Button>
                        </div>

                        <div className="overflow-hidden border rounded-lg">
                            <table className="w-full text-sm table-fixed">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 w-[50%]">Name</th>
                                        <th className="text-left px-4 py-3 w-[30%]">Domain</th>
                                        <th className="text-center px-4 py-3 w-[20%]">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {departments.map(d => (
                                        <tr key={d.id} className="border-t">
                                            <td className="px-4 py-3">{d.department_name}</td>
                                            <td className="px-4 py-3 text-gray-500">{d.domain}</td>
                                            <td className="px-4 py-3 text-center space-x-2">
                                                <button onClick={() => handleEditDept(d)}>
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => deleteDepartment(d.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>

                    {/* PROGRAMS (WITH INLINE EDIT) */}
                    <div className="border rounded-xl bg-white p-4 shadow-sm">

                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold">Programs</h2>
                            <Button size="sm" onClick={() => setOpenProgram(true)}>
                                <Plus size={14} /> Add
                            </Button>
                        </div>

                        <div className="overflow-hidden border rounded-lg">
                            <table className="w-full text-sm table-fixed">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 w-[55%]">Program</th>
                                        <th className="text-left px-4 py-3 w-[25%]">Code</th>
                                        <th className="text-center px-4 py-3 w-[20%]">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {departments.flatMap(d => d.programs).map(p => (
                                        <tr key={p.id} className="border-t">

                                            {/* PROGRAM NAME */}
                                            <td className="px-4 py-3">
                                                {editingProgramId === p.id ? (
                                                    <Input
                                                        value={programEditForm.program_name}
                                                        onChange={(e) =>
                                                            setProgramEditForm({
                                                                ...programEditForm,
                                                                program_name: e.target.value
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    p.program_name
                                                )}
                                            </td>

                                            {/* CODE */}
                                            <td className="px-4 py-3">
                                                {editingProgramId === p.id ? (
                                                    <Input
                                                        value={programEditForm.program_code}
                                                        onChange={(e) =>
                                                            setProgramEditForm({
                                                                ...programEditForm,
                                                                program_code: e.target.value
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    p.program_code
                                                )}
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-4 py-3 text-center space-x-2">

                                                {editingProgramId === p.id ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                router.put(`/program/${p.id}`, programEditForm, {
                                                                    onSuccess: () => setEditingProgramId(null)
                                                                })
                                                            }}
                                                        >
                                                            Save
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setEditingProgramId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingProgramId(p.id)
                                                                setProgramEditForm({
                                                                    program_name: p.program_name,
                                                                    program_code: p.program_code
                                                                })
                                                            }}
                                                        >
                                                            <Pencil size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() => deleteProgram(p.id)}
                                                            className="text-red-500"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}

                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>

                </div>

                {/* ================= FIGMA CARDS ================= */}
                <div className="space-y-6">

                    {departments.map(dept => (
                        <div key={dept.id} className="border rounded-xl bg-white shadow-sm p-5">

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {dept.department_name.replace(" Department", "")}
                                    </h2>
                                    <p className="text-sm text-gray-500">{dept.domain}</p>
                                </div>

                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setProgramForm({
                                            program_name: '',
                                            program_code: '',
                                            department_id: dept.id.toString()
                                        })
                                        setOpenProgram(true)
                                    }}
                                >
                                    <Plus size={14} /> Add Program
                                </Button>
                            </div>

                            <div className="overflow-hidden border rounded-lg">
                                <table className="w-full text-sm table-fixed">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Program</th>
                                            <th className="px-4 py-3 text-left">Code</th>
                                            <th className="px-4 py-3 text-center">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {dept.programs.map(p => (
                                            <tr key={p.id} className="border-t">
                                                <td className="px-4 py-3">{p.program_name}</td>
                                                <td className="px-4 py-3">{p.program_code}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => deleteProgram(p.id)}
                                                        className="text-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    ))}

                </div>

                {/* ================= MODALS ================= */}

                {/* DEPARTMENT */}
                <Dialog open={openDept} onOpenChange={setOpenDept}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditDept ? "Edit Department" : "Add Department"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitDepartment} className="space-y-4">

                            <Input
                                value={deptForm.department_code}
                                onChange={(e) =>
                                    setDeptForm({ ...deptForm, department_code: e.target.value })
                                }
                                placeholder="Department Code"
                            />

                            <Input
                                value={deptForm.department_name}
                                onChange={(e) =>
                                    setDeptForm({ ...deptForm, department_name: e.target.value })
                                }
                                placeholder="Department Name"
                            />

                            <Input
                                value={deptForm.domain}
                                onChange={(e) =>
                                    setDeptForm({ ...deptForm, domain: e.target.value })
                                }
                                placeholder="Domain"
                            />

                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>

                {/* PROGRAM */}
                <Dialog open={openProgram} onOpenChange={setOpenProgram}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Program</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitProgram} className="space-y-4">

                            <Input
                                placeholder="Program Name"
                                value={programForm.program_name}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, program_name: e.target.value })
                                }
                            />

                            <Input
                                placeholder="Program Code"
                                value={programForm.program_code}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, program_code: e.target.value })
                                }
                            />

                            <DialogFooter>
                                <Button type="submit">Save Program</Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}

export default Index