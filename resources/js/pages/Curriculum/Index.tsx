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

    const [activeDepartment, setActiveDepartment] = useState(selectedDepartment)
    const [activeProgram, setActiveProgram] = useState(selectedProgram)

    const [open, setOpen] = useState(false)
    const [ignorePrereq, setIgnorePrereq] = useState(false)

    const [form, setForm] = useState({
        subject_id: '',
        year_level: 1,
        semester: 1
    })

    // =========================
    // FILTERED SUBJECTS
    // =========================
    const filteredSubjects = subjects.filter(
        (s: any) =>
            s.program_id === activeProgram || s.subject_type === 'minor'
    )

    // =========================
    // HANDLERS
    // =========================
    const handleDepartmentChange = (id: number) => {
        setActiveDepartment(id)

        router.get('/curriculum', {
            department_id: id
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

    const submitInline = (subjectId: any, year: number, sem: number) => {
        if (!subjectId) return

        router.post('/curriculum', {
            subject_id: Number(subjectId),
            program_id: activeProgram,
            year_level: year,
            semester: sem,
            ignore_prereq: ignorePrereq
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['curriculum'] })
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

            <div className="min-h-screen bg-[#eef3f1] px-10 py-8 space-y-8">

                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold">Curriculum Guide</h1>
                        <p className="text-sm text-gray-500 max-w-xl">
                            Structured overview of subjects, prerequisites, and scheduling flow.
                        </p>
                    </div>

                    <Button
                        onClick={() => setOpen(true)}
                        disabled={!activeProgram}
                    >
                        + Add Subject (Modal)
                    </Button>
                </div>

                {/* FILTERS */}
                <div className="flex gap-3">
                    <select
                        value={activeDepartment || ''}
                        onChange={(e) => handleDepartmentChange(Number(e.target.value))}
                        className="h-10 px-3 rounded-lg border bg-white"
                    >
                        {departments.map((d: any) => (
                            <option key={d.id} value={d.id}>
                                {d.department_name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={activeProgram || ''}
                        onChange={(e) => handleProgramChange(Number(e.target.value))}
                        className="h-10 px-3 rounded-lg border bg-white"
                    >
                        <option value="">Select Program</option>
                        {programs.map((p: any) => (
                            <option key={p.id} value={p.id}>
                                {p.program_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* PROGRAM TITLE */}
                <div>
                    <h2 className="text-xl font-semibold">
                        {programs.find((p: any) => p.id === activeProgram)?.program_name || 'Select Program'}
                    </h2>
                </div>

                {/* CURRICULUM */}
                <div className="space-y-6">

                    {Object.keys(curriculum || {}).length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No curriculum available
                        </div>
                    )}

                    {Object.entries(curriculum || {}).map(([year, semesters]: any) => (
                        <div key={year} className="bg-white border rounded-2xl p-6 shadow-sm">

                            <h3 className="text-lg font-semibold mb-5">
                                {getYearLabel(year)}
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">

                                {[1, 2].map((sem) => {
                                    const data = semesters?.[sem]
                                    if (!data) return null

                                    return (
                                        <div key={sem} className="border rounded-xl p-5 bg-gray-50">

                                            <h4 className="font-medium text-sm mb-4">
                                                {sem === 1 ? 'FIRST SEMESTER' : 'SECOND SEMESTER'}
                                            </h4>

                                            <div className="grid grid-cols-2 gap-6 text-sm">

                                                {/* MINOR */}
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-2">Minor</p>

                                                    <div className="space-y-1 mb-2">
                                                        {data.minor?.map((sub: any) => (
                                                            <div key={sub.id} className="flex justify-between text-xs">
                                                                <span>
                                                                    <b>{sub.subject.subject_code}</b> - {sub.subject.subject_name}
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

                                                    <select
                                                        className="w-full text-xs border rounded px-2 py-1"
                                                        onChange={(e) =>
                                                            submitInline(e.target.value, Number(year), sem)
                                                        }
                                                    >
                                                        <option value="">+ Add Minor</option>
                                                        {filteredSubjects
                                                            .filter((s: any) => s.subject_type === 'minor')
                                                            .map((s: any) => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.subject_code} - {s.subject_name}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>

                                                {/* MAJOR */}
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-2">Major</p>

                                                    <div className="space-y-1 mb-2">
                                                        {data.major?.map((sub: any) => (
                                                            <div key={sub.id} className="flex justify-between text-xs">
                                                                <span>
                                                                    <b>{sub.subject.subject_code}</b> - {sub.subject.subject_name}
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

                                                    <select
                                                        className="w-full text-xs border rounded px-2 py-1"
                                                        onChange={(e) =>
                                                            submitInline(e.target.value, Number(year), sem)
                                                        }
                                                    >
                                                        <option value="">+ Add Major</option>
                                                        {filteredSubjects
                                                            .filter((s: any) => s.subject_type === 'major')
                                                            .map((s: any) => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.subject_code} - {s.subject_name}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>

                                            </div>

                                        </div>
                                    )
                                })}

                            </div>
                        </div>
                    ))}

                </div>

                {/* MODAL (OPTIONAL) */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-md">

                        <DialogHeader>
                            <DialogTitle>Add Subject to Curriculum</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">

                            <select
                                className="w-full border rounded-lg px-3 py-2"
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

                            <select
                                className="w-full border rounded-lg px-3 py-2"
                                onChange={(e) =>
                                    setForm({ ...form, year_level: Number(e.target.value) })
                                }
                            >
                                <option value={1}>1st Year</option>
                                <option value={2}>2nd Year</option>
                                <option value={3}>3rd Year</option>
                                <option value={4}>4th Year</option>
                            </select>

                            <select
                                className="w-full border rounded-lg px-3 py-2"
                                onChange={(e) =>
                                    setForm({ ...form, semester: Number(e.target.value) })
                                }
                            >
                                <option value={1}>1st Semester</option>
                                <option value={2}>2nd Semester</option>
                            </select>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={ignorePrereq}
                                    onChange={(e) => setIgnorePrereq(e.target.checked)}
                                />
                                <span className="text-sm">
                                    Ignore prerequisite validation
                                </span>
                            </div>

                            <Button
                                onClick={() =>
                                    submitInline(
                                        form.subject_id,
                                        form.year_level,
                                        form.semester
                                    )
                                }
                            >
                                Add Subject
                            </Button>

                        </div>

                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}