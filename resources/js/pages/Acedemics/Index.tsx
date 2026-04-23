import { Head, router, usePage } from '@inertiajs/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import AppLayout from '@/layouts/app-layout'
import { Label } from '@/components/ui/label'

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

const DOMAINS = [
    "Computer Studies / IT",
    "Engineering",
    "Business & Accountancy",
    "Education",
    "Health Sciences",
    "Arts & Humanities",
    "Sciences & Mathematics",
    "Agriculture & Fisheries",
    "Hospitality / Tourism",
    "Law / Security / Public Service",
    "Maritime",
    "Fine Arts / Design / Architecture"
]
/* ================= PAGE ================= */

const Index = () => {
    const { departments } = usePage().props as { departments: Department[] }

    /* ================= STATES ================= */

    const [openDept, setOpenDept] = useState(false)
    const [openProgram, setOpenProgram] = useState(false)

    const [isEditDept, setIsEditDept] = useState(false)
    const [editDeptId, setEditDeptId] = useState<number | null>(null)
    const [openProgramEdit, setOpenProgramEdit] = useState(false)
    const [editProgramId, setEditProgramId] = useState<number | null>(null)


    const [deptForm, setDeptForm] = useState({
        department_code: null as string | null,
        department_name: '',
        domain: ''
    })

    const [programForm, setProgramForm] = useState({
        program_name: '',
        program_code: '',
        department_id: ''
    })

    /* ================= PROGRAM INLINE EDIT ================= */

    // const [editingProgramId, setEditingProgramId] = useState<number | null>(null)

    // const [programEditForm, setProgramEditForm] = useState({
    //     program_name: '',
    //     program_code: '',
    //     department_id: ''
    // })

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
    const handleEditProgram = (p: any) => {
        setProgramForm({
            program_name: p.program_name,
            program_code: p.program_code,
            department_id: p.department_id
        })

        setEditProgramId(p.id)
        setOpenProgramEdit(true)
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

        if (!deptForm.domain) {
            alert("Select a domain")
            return
        }

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
            department_code: null,
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
                            <Button
                                size="sm"
                                onClick={() => {
                                    resetDept()       // 🔥 clear old data
                                    setIsEditDept(false)
                                    setOpenDept(true)
                                }}
                            >
                                <Plus size={14} /> Add
                            </Button>
                        </div>

                        <div className="overflow-hidden border rounded-lg">
                            <table className="w-full text-sm table-fixed">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 w-[50%]">Name</th>
                                        <th className="text-left px-4 py-3 w-[30%]">Field</th>
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

                                            <td className="px-4 py-3">
                                                {p.program_name}
                                            </td>

                                            <td className="px-4 py-3">
                                                {p.program_code}
                                            </td>

                                            <td className="px-4 py-3 text-center space-x-2">
                                                <button onClick={() => handleEditProgram(p)}>
                                                    <Pencil size={14} />
                                                </button>

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

                            </div>

                            <div className="overflow-hidden border rounded-lg">
                                <table className="w-full text-sm table-fixed">
                                    <thead className="">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Program</th>
                                            <th className="px-4 py-3 text-left">Code</th>
                                            {/* <th className="px-4 py-3 text-center">Action</th> */}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {dept.programs.map(p => (
                                            <tr key={p.id} className="border-t">
                                                <td className="px-4 py-3">{p.program_name}</td>
                                                <td className="px-4 py-3">{p.program_code}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {/* <button
                                                        onClick={() => deleteProgram(p.id)}
                                                        className="text-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button> */}
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
                {/* EDIT PROGRAM */}
                <Dialog
                    open={openProgramEdit}
                    onOpenChange={(open) => {
                        setOpenProgramEdit(open)

                        if (!open) {
                            setEditProgramId(null)
                            setProgramForm({
                                program_name: '',
                                program_code: '',
                                department_id: ''
                            })
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Program</DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()

                                if (!editProgramId) return

                                router.put(`/program/${editProgramId}`, programForm, {
                                    onSuccess: () => {
                                        setOpenProgramEdit(false)
                                        setEditProgramId(null)

                                        setProgramForm({
                                            program_name: '',
                                            program_code: '',
                                            department_id: ''
                                        })

                                        router.reload({ only: ['departments'] })
                                    }
                                })
                            }}
                            className="space-y-4"
                        >

                            <Label>Program Name</Label>
                            <Input
                                value={programForm.program_name}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, program_name: e.target.value })
                                }
                            />

                            <Label>Program Code</Label>
                            <Input
                                value={programForm.program_code}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, program_code: e.target.value })
                                }
                            />

                            <Label>Department</Label>
                            <select
                                value={programForm.department_id}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, department_id: e.target.value })
                                }
                                className="w-full border rounded-md p-2 text-sm"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.department_name.replace(" Department", "")}
                                    </option>
                                ))}
                            </select>

                            <DialogFooter>
                                <Button type="submit">Update Program</Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>
                {/* DEPARTMENT */}
                <Dialog
                    open={openDept}
                    onOpenChange={(open) => {
                        setOpenDept(open)

                        if (!open) {
                            resetDept() // 🔥 reset when closing
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditDept ? "Edit Department" : "Add Department"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitDepartment} className="space-y-4">

                            {/* <Input
                                value={deptForm.department_code}
                                onChange={(e) =>
                                    setDeptForm({ ...deptForm, department_code: e.target.value })
                                }
                                placeholder="Department Code"
                            /> */}

                            <Input
                                value={deptForm.department_name}
                                onChange={(e) =>
                                    setDeptForm({ ...deptForm, department_name: e.target.value })
                                }
                                placeholder="Department Name"
                            />

                            <select
                                value={deptForm.domain}
                                onChange={(e) =>
                                    setDeptForm({ ...deptForm, domain: e.target.value })
                                }
                                className="w-full border rounded-md p-2 text-sm"
                            >
                                <option value="">Select Domain</option>
                                {DOMAINS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>

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

                            {/* DEPARTMENT DROPDOWN */}
                            <Label>Program Name</Label>

                            <Input
                                placeholder="Program Name"
                                value={programForm.program_name}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, program_name: e.target.value })
                                }
                            />
                            <Label>Program Code</Label>
                            <Input
                                placeholder="Program Code"
                                value={programForm.program_code}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, program_code: e.target.value })
                                }
                            />
                            <select
                                value={programForm.department_id}
                                onChange={(e) =>
                                    setProgramForm({ ...programForm, department_id: e.target.value })
                                }
                                className="w-full border rounded-md p-2 text-sm"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.department_name.replace(" Department", "")}
                                    </option>
                                ))}
                            </select>

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