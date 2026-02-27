// import { Head, router, usePage } from '@inertiajs/react'
// import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
// import { useState } from 'react'

// import { Button } from '@/components/ui/button'
// import {
//     Dialog,
//     DialogContent,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import AppLayout from '@/layouts/app-layout'
// interface Program {
//     id: number
//     program_name: string
// }

// interface Subject {
//     id: number
//     program_id: number
//     subject_code: string
//     subject_name: string
//     units: number
//     lecture_hours: number
//     lab_hours: number
//     year_level: number
//     semester: number
//     program: Program
// }

// const emptyForm = {
//     program_id: '',
//     subject_code: '',
//     subject_name: '',
//     units: '',
//     lecture_hours: '',
//     lab_hours: '',
//     year_level: '',
//     semester: ''
// }

// export default function Index() {

//     const { subjects, programs } = usePage().props as unknown as {
//         subjects: Subject[],
//         programs: Program[]
//     }

//     const [open, setOpen] = useState(false)
//     const [form, setForm] = useState<any>(emptyForm)
//     const [isEdit, setIsEdit] = useState(false)
//     const [editId, setEditId] = useState<number | null>(null)
//     const [loading, setLoading] = useState(false)

//     const handleOpen = () => {
//         setForm(emptyForm)
//         setIsEdit(false)
//         setEditId(null)
//         setOpen(true)
//     }

//     const handleOpenEdit = (subject: Subject) => {
//         setForm(subject)
//         setIsEdit(true)
//         setEditId(subject.id)
//         setOpen(true)
//     }

//     const handleClose = () => {
//         setOpen(false)
//         setForm(emptyForm)
//         setIsEdit(false)
//         setEditId(null)
//     }

//     const handleChange = (
//         e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//     ) => {
//         setForm({
//             ...form,
//             [e.target.name]: e.target.value
//         })
//     }

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault()
//         setLoading(true)

//         if (isEdit && editId) {
//             router.put(`/subject/${editId}`, form, {
//                 onSuccess: () => {
//                     setLoading(false)
//                     handleClose()
//                 },
//                 onError: () => setLoading(false)
//             })
//         } else {
//             router.post('/subject', form, {
//                 onSuccess: () => {
//                     setLoading(false)
//                     handleClose()
//                 },
//                 onError: () => setLoading(false)
//             })
//         }
//     }

//     const handleDelete = (id: number) => {
//         if (!confirm("Delete this subject?")) return
//         router.delete(`/subject/${id}`)
//     }

//     return (
//         <AppLayout breadcrumbs={[{ title: "Subjects", href: '/subject' }]}>
//             <Head title="Subjects" />

//             <div className="p-6">

//                 {/* HEADER */}
//                 <div className="flex justify-between items-center mb-6">
//                     <div className="flex items-center">
//                         <BookOpen className="mr-2 text-blue-600" size={28} />
//                         <h1 className="text-2xl font-bold">Manage Subjects</h1>
//                     </div>

//                     <Button onClick={handleOpen} className="gap-2">
//                         <Plus size={18} />
//                         Add Subject
//                     </Button>
//                 </div>

//                 {/* TABLE */}
//                 <div className="overflow-x-auto rounded-lg shadow border">
//                     <table className="min-w-full bg-white">
//                         <thead>
//                             <tr className="bg-gray-100">
//                                 <th className="px-4 py-2">Program</th>
//                                 <th className="px-4 py-2">Code</th>
//                                 <th className="px-4 py-2">Name</th>
//                                 <th className="px-4 py-2">Units</th>
//                                 <th className="px-4 py-2">Lec</th>
//                                 <th className="px-4 py-2">Lab</th>
//                                 <th className="px-4 py-2">Year</th>
//                                 <th className="px-4 py-2">Sem</th>
//                                 <th className="px-4 py-2 text-center">Actions</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {subjects.map(subject => (
//                                 <tr key={subject.id} className="border-t">
//                                     <td className="px-4 py-2">{subject.program.program_name}</td>
//                                     <td className="px-4 py-2">{subject.subject_code}</td>
//                                     <td className="px-4 py-2">{subject.subject_name}</td>
//                                     <td className="px-4 py-2">{subject.units}</td>
//                                     <td className="px-4 py-2">{subject.lecture_hours}</td>
//                                     <td className="px-4 py-2">{subject.lab_hours}</td>
//                                     <td className="px-4 py-2">{subject.year_level}</td>
//                                     <td className="px-4 py-2">{subject.semester}</td>
//                                     <td className="px-4 py-2 text-center">
//                                         <Button size="sm" variant="outline" className="mr-2"
//                                             onClick={() => handleOpenEdit(subject)}>
//                                             <Pencil size={16} />
//                                         </Button>
//                                         <Button size="sm" variant="destructive"
//                                             onClick={() => handleDelete(subject.id)}>
//                                             <Trash2 size={16} />
//                                         </Button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* MODAL */}
//                 <Dialog open={open} onOpenChange={setOpen}>
//                     <DialogContent>
//                         <DialogHeader>
//                             <DialogTitle>
//                                 {isEdit ? "Edit Subject" : "Add Subject"}
//                             </DialogTitle>
//                         </DialogHeader>

//                         <form onSubmit={handleSubmit} className="space-y-3">

//                             <Label>Program</Label>
//                             <select name="program_id" value={form.program_id}
//                                 onChange={handleChange} className="w-full border rounded p-2" required>
//                                 <option value="">Select Program</option>
//                                 {programs.map(p => (
//                                     <option key={p.id} value={p.id}>
//                                         {p.program_name}
//                                     </option>
//                                 ))}
//                             </select>

//                             <Label>Subject Code</Label>
//                             <Input name="subject_code" value={form.subject_code}
//                                 onChange={handleChange} required />

//                             <Label>Subject Name</Label>
//                             <Input name="subject_name" value={form.subject_name}
//                                 onChange={handleChange} required />

//                             <Label>Units</Label>
//                             <Input type="number" name="units"
//                                 value={form.units} onChange={handleChange} required />

//                             <Label>Lecture Hours</Label>
//                             <Input type="number" name="lecture_hours"
//                                 value={form.lecture_hours} onChange={handleChange} required />

//                             <Label>Lab Hours</Label>
//                             <Input type="number" name="lab_hours"
//                                 value={form.lab_hours} onChange={handleChange} required />

//                             <Label>Year Level</Label>
//                             <select name="year_level" value={form.year_level}
//                                 onChange={handleChange} className="w-full border rounded p-2" required>
//                                 <option value="">Select</option>
//                                 <option value="1">1</option>
//                                 <option value="2">2</option>
//                                 <option value="3">3</option>
//                                 <option value="4">4</option>
//                             </select>

//                             <Label>Semester</Label>
//                             <select name="semester" value={form.semester}
//                                 onChange={handleChange} className="w-full border rounded p-2" required>
//                                 <option value="">Select</option>
//                                 <option value="1">1st</option>
//                                 <option value="2">2nd</option>
//                             </select>

//                             <DialogFooter>
//                                 <Button type="button" variant="outline"
//                                     onClick={handleClose}>
//                                     Cancel
//                                 </Button>
//                                 <Button type="submit">
//                                     {isEdit ? "Update" : "Create"}
//                                 </Button>
//                             </DialogFooter>
//                         </form>
//                     </DialogContent>
//                 </Dialog>

//             </div>
//         </AppLayout>
//     )
// }



// second ui 


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
    units: '',
    lecture_hours: '',
    lab_hours: '',
    year_level: '',
    semester: ''
}

export default function Index() {

    const { subjects, programs, filters } = usePage().props as unknown as {
        subjects: Subject[],
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

    const handleOpenEdit = (subject: Subject) => {
        setForm({
            program_id: subject.program_id,
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
            units: subject.units,
            lecture_hours: subject.lecture_hours,
            lab_hours: subject.lab_hours,
            year_level: subject.year_level,
            semester: subject.semester
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
                            {subjects.length > 0 ? subjects.map(subject => (
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

                {/* ============================
                    MODAL
                ============================= */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? "Edit Subject" : "Add Subject"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-3">

                            <Label>Program</Label>
                            <select
                                name="program_id"
                                value={form.program_id}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                required
                            >
                                <option value="">Select Program</option>
                                {programs.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.program_name}
                                    </option>
                                ))}
                            </select>

                            <Label>Subject Code</Label>
                            <Input name="subject_code"
                                value={form.subject_code}
                                onChange={handleChange} required />

                            <Label>Subject Name</Label>
                            <Input name="subject_name"
                                value={form.subject_name}
                                onChange={handleChange} required />

                            <Label>Units</Label>
                            <Input type="number"
                                name="units"
                                value={form.units}
                                onChange={handleChange} required />

                            <Label>Lecture Hours</Label>
                            <Input type="number"
                                name="lecture_hours"
                                value={form.lecture_hours}
                                onChange={handleChange} required />

                            <Label>Lab Hours</Label>
                            <Input type="number"
                                name="lab_hours"
                                value={form.lab_hours}
                                onChange={handleChange} required />

                            <Label>Year Level</Label>
                            <select name="year_level"
                                value={form.year_level}
                                onChange={handleChange}
                                className="w-full border rounded p-2" required>
                                <option value="">Select</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>

                            <Label>Semester</Label>
                            <select name="semester"
                                value={form.semester}
                                onChange={handleChange}
                                className="w-full border rounded p-2" required>
                                <option value="">Select</option>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                            </select>

                            <DialogFooter>
                                <Button type="button"
                                    variant="outline"
                                    onClick={handleClose}>
                                    Cancel
                                </Button>

                                <Button type="submit">
                                    {loading
                                        ? "Saving..."
                                        : isEdit ? "Update Subject" : "Create Subject"}
                                </Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}
