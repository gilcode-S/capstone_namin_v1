import { router } from '@inertiajs/react'
import { useState } from 'react'


import { Button } from '@/components/ui/button'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import AppLayout from '@/layouts/app-layout'
export default function Curriculum({
    curriculum,
    departments,
    programs,
    subjects,
    selectedDepartment,
    selectedProgram
}: any) {

    // =========================
    // STATE
    // =========================
    const [activeDepartment, setActiveDepartment] = useState(selectedDepartment)
    const [activeProgram, setActiveProgram] = useState(selectedProgram)

    const [open, setOpen] = useState(false)

    const [form, setForm] = useState({
        subject_id: '',
        year_level: 1,
        semester: 1
    })

    // =========================
    // HANDLERS
    // =========================
    const handleDepartmentChange = (id: number) => {
        setActiveDepartment(id)

        router.get('/curriculum', {
            department_id: id,
            program_id: activeProgram
        }, { preserveState: true, replace: true })
    }

    const handleProgramChange = (id: number) => {
        setActiveProgram(id)

        router.get('/curriculum', {
            department_id: activeDepartment,
            program_id: id
        }, { preserveState: true, replace: true })
    }

    const deleteCurriculum = (id: number) => {
        if (confirm("Remove subject?")) {
            router.delete(`/curriculum/${id}`)
        }
    }

    const submitForm = () => {
    router.post('/curriculum', {
        ...form,
        program_id: activeProgram
    }, {
        preserveScroll: true,
        onSuccess: () => {
            setOpen(false)

            setForm({
                subject_id: '',
                year_level: 1,
                semester: 1
            })
        }
    })
}
    const getYearLabel = (year: any) => {
        return {
            1: 'FIRST YEAR',
            2: 'SECOND YEAR',
            3: 'THIRD YEAR',
            4: 'FOURTH YEAR'
        }[year] || `YEAR ${year}`
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Curriculum', href: '/curriculum' }]}>

            <div className="w-full px-8 py-6 space-y-6">

                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-start">

                    <div>
                        <h1 className="text-2xl font-bold">Curriculum Guide</h1>
                        <p className="text-sm text-muted-foreground">
                            Provides a structured overview of courses, their prerequisites,
                            and scheduling guidelines to support effective curriculum planning.
                        </p>

                        {/* PROGRAM FILTER */}
                        {/* <div className="flex items-center gap-4 text-sm mt-3">
                            {programs.map((p: any) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProgramChange(p.id)}
                                    className={`font-medium ${activeProgram === p.id
                                        ? 'text-black'
                                        : 'text-gray-400'
                                        }`}
                                >
                                    {p.program_name}
                                </button>
                            ))}
                        </div> */}
                    </div>

                    <Button onClick={() => setOpen(true)}>
                        Edit Curriculum
                    </Button>

                </div>

                {/* ================= DEPARTMENT TABS ================= */}
                <div className="w-full bg-gray-100 p-1 rounded-xl flex gap-1 overflow-x-auto">
                    {departments.map((d: any) => {
                        const isActive = activeDepartment === d.id

                        return (
                            <button
                                key={d.id}
                                onClick={() => handleDepartmentChange(d.id)}
                                className={`flex-1 px-4 py-3 text-sm rounded-lg transition-all
                                    ${isActive
                                        ? 'bg-white shadow font-semibold text-black'
                                        : 'text-gray-500 hover:text-black'
                                    }`}
                            >
                                {d.department_name}
                            </button>
                        )
                    })}
                </div>

                {/* ================= CURRICULUM ================= */}
                <div className="space-y-6">

                    {Object.keys(curriculum || {}).length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No curriculum available
                        </div>
                    )}

                    {Object.entries(curriculum || {}).map(([year, semesters]: any) => (
                        <div key={year} className="border rounded-2xl bg-white shadow-sm p-6">

                            <h2 className="text-lg font-semibold mb-5">
                                {getYearLabel(year)}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                {[1, 2].map((sem) => {
                                    const data = semesters?.[sem]
                                    if (!data) return null

                                    return (
                                        <div key={sem} className="border rounded-2xl p-5 bg-gray-50">

                                            <h3 className="font-medium mb-3">
                                                {sem === 1 ? 'FIRST SEMESTER' : 'SECOND SEMESTER'}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4 text-sm">

                                                {/* MINOR */}
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Minor Subjects
                                                    </p>

                                                    <div className="space-y-1">
                                                        {data.minor?.map((sub: any) => (
                                                            <div key={sub.id} className="flex justify-between text-xs">
                                                                <span>
                                                                    <span className="font-medium">
                                                                        {sub.subject.subject_code}
                                                                    </span> - {sub.subject.subject_name}
                                                                </span>

                                                                <button
                                                                    onClick={() => deleteCurriculum(sub.id)}
                                                                    className="text-red-400 hover:text-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* MAJOR */}
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Major Subjects
                                                    </p>

                                                    <div className="space-y-1">
                                                        {data.major?.map((sub: any) => (
                                                            <div key={sub.id} className="flex justify-between text-xs">
                                                                <span>
                                                                    <span className="font-medium">
                                                                        {sub.subject.subject_code}
                                                                    </span> - {sub.subject.subject_name}
                                                                </span>

                                                                <button
                                                                    onClick={() => deleteCurriculum(sub.id)}
                                                                    className="text-red-400 hover:text-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    )
                                })}

                            </div>
                        </div>
                    ))}

                </div>

                {/* ================= MODAL ================= */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-md">

                        <DialogHeader>
                            <DialogTitle>Add Subject to Curriculum</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">

                            {/* SUBJECT */}
                            <div>
                                <label className="text-sm font-medium">Subject</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                    value={form.subject_id}
                                    onChange={(e) =>
                                        setForm({ ...form, subject_id: e.target.value })
                                    }
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map((s: any) => (
                                        <option key={s.id} value={s.id}>
                                            {s.subject_code} - {s.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* YEAR */}
                            <div>
                                <label className="text-sm font-medium">Year Level</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                    value={form.year_level}
                                    onChange={(e) =>
                                        setForm({ ...form, year_level: Number(e.target.value) })
                                    }
                                >
                                    <option value={1}>1st Year</option>
                                    <option value={2}>2nd Year</option>
                                    <option value={3}>3rd Year</option>
                                    <option value={4}>4th Year</option>
                                </select>
                            </div>

                            {/* SEM */}
                            <div>
                                <label className="text-sm font-medium">Semester</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                    value={form.semester}
                                    onChange={(e) =>
                                        setForm({ ...form, semester: Number(e.target.value) })
                                    }
                                >
                                    <option value={1}>1st Semester</option>
                                    <option value={2}>2nd Semester</option>
                                </select>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>

                                <Button
                                    onClick={submitForm}
                                    disabled={!form.subject_id}
                                >
                                    Add Subject
                                </Button>
                            </div>

                        </div>

                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}