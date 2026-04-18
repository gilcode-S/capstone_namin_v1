import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    const [editMode, setEditMode] = useState(false)

    // =========================
    // ADD YEAR STATE (FIXED)
    // =========================
    const [extraYears, setExtraYears] = useState<number[]>([])

    // =========================
    // MERGE YEARS
    // =========================
    const backendYears = Object.keys(curriculum || {}).map(Number)

    const allYears = [...new Set([...backendYears, ...extraYears])].sort(
        (a, b) => a - b
    )

    // =========================
    // HANDLERS
    // =========================
    const handleDepartmentChange = (id: number) => {
        setActiveDepartment(id)
        setActiveProgram(null)

        router.get('/curriculum', {
            department_id: id,
            program_id: null
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
            router.delete(`/curriculum/${id}`, {
                preserveScroll: true
            })
        }
    }

    const submitInline = (subjectId: any, year: number, sem: number) => {
        if (!subjectId) return

        router.post('/curriculum', {
            subject_id: Number(subjectId),
            program_id: activeProgram,
            year_level: year,
            semester: sem,
        }, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['curriculum'] })
        })
    }

    const getYearLabel = (year: number) => ({
        1: 'FIRST YEAR',
        2: 'SECOND YEAR',
        3: 'THIRD YEAR',
        4: 'FOURTH YEAR'
    }[year] || `YEAR ${year}`)

    return (
        <AppLayout>

            <div className="min-h-screen bg-[#eef3f1] px-10 py-8 space-y-8">

                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold">Curriculum Guide</h1>
                        <p className="text-sm text-gray-500 max-w-xl">
                            Structured overview of courses, prerequisites, and scheduling flow.
                        </p>
                    </div>

                    <Button
                        onClick={() => setEditMode(!editMode)}
                        disabled={!activeProgram}
                    >
                        {editMode ? 'Done Editing' : 'Edit Curriculum'}
                    </Button>
                </div>

                {/* FILTERS */}
                <div className="flex gap-3">
                    <select
                        value={activeDepartment || ''}
                        onChange={(e) => handleDepartmentChange(Number(e.target.value))}
                        className="h-10 px-3 rounded-lg border bg-white"
                    >
                        <option value="">Select Department</option>
                        {departments.map((d: any) => (
                            <option key={d.id} value={d.id}>
                                {d.department_name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={activeProgram || ''}
                        disabled={!activeDepartment}
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

                {/* BLOCK IF NOT READY */}
                {!activeDepartment || !activeProgram ? (
                    <div className="text-center text-gray-400 py-20">
                        Please select department and program first
                    </div>
                ) : (
                    <>
                        {/* PROGRAM TITLE + ADD YEAR */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                {programs.find((p: any) => p.id === activeProgram)?.program_name}
                            </h2>

                            {/* ✅ ADD YEAR BUTTON (FIXED) */}
                            {editMode && (
                                <button
                                    onClick={() => {
                                        const nextYear =
                                            allYears.length > 0
                                                ? Math.max(...allYears) + 1
                                                : 1

                                        setExtraYears([...extraYears, nextYear])
                                    }}
                                    className="text-sm px-3 py-1 border rounded-lg bg-white hover:bg-gray-100"
                                >
                                    + Add Year
                                </button>
                            )}
                        </div>

                        {/* CURRICULUM */}
                        <div className="space-y-6">

                            {allYears.map((year) => {

                                const semesters = curriculum?.[year] || {}

                                return (
                                    <div key={year} className="bg-white border rounded-2xl p-6">

                                        {/* YEAR LABEL */}
                                        <h3 className="text-lg font-semibold mb-4">
                                            {getYearLabel(year)}
                                        </h3>

                                        {/* SEMESTERS (MAJOR / MINOR UI KEPT SAME) */}
                                        <div className="grid md:grid-cols-2 gap-6">

                                            {[1, 2].map((sem) => {

                                                const data = semesters?.[sem] || {
                                                    major: [],
                                                    minor: []
                                                }

                                                return (
                                                    <div key={sem} className="border rounded-xl p-5 bg-gray-50">

                                                        <h4 className="font-medium text-sm mb-3">
                                                            {sem === 1 ? 'FIRST SEMESTER' : 'SECOND SEMESTER'}
                                                        </h4>

                                                        <div className="grid grid-cols-2 gap-6 text-sm">

                                                            {/* MINOR */}
                                                            <div>
                                                                <p className="text-xs text-gray-400 mb-2">Minor</p>

                                                                {data.minor.map((sub: any) => (
                                                                    <div key={sub.id} className="flex justify-between text-xs">
                                                                        <span>
                                                                            <b>{sub.subject.subject_code}</b> - {sub.subject.subject_name}
                                                                        </span>

                                                                        {editMode && (
                                                                            <button
                                                                                onClick={() => deleteCurriculum(sub.id)}
                                                                                className="text-red-400"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {editMode && (
                                                                    <select
                                                                        className="w-full text-xs border rounded mt-2"
                                                                        onChange={(e) =>
                                                                            submitInline(e.target.value, year, sem)
                                                                        }
                                                                    >
                                                                        <option value="">+ Add Minor</option>
                                                                        {subjects
                                                                            .filter((s: any) => s.subject_type === 'minor')
                                                                            .map((s: any) => (
                                                                                <option key={s.id} value={s.id}>
                                                                                    {s.subject_code} - {s.subject_name}
                                                                                </option>
                                                                            ))}
                                                                    </select>
                                                                )}
                                                            </div>

                                                            {/* MAJOR */}
                                                            <div>
                                                                <p className="text-xs text-gray-400 mb-2">Major</p>

                                                                {data.major.map((sub: any) => (
                                                                    <div key={sub.id} className="flex justify-between text-xs">
                                                                        <span>
                                                                            <b>{sub.subject.subject_code}</b> - {sub.subject.subject_name}
                                                                        </span>

                                                                        {editMode && (
                                                                            <button
                                                                                onClick={() => deleteCurriculum(sub.id)}
                                                                                className="text-red-400"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {editMode && (
                                                                    <select
                                                                        className="w-full text-xs border rounded mt-2"
                                                                        onChange={(e) =>
                                                                            submitInline(e.target.value, year, sem)
                                                                        }
                                                                    >
                                                                        <option value="">+ Add Major</option>
                                                                        {subjects
                                                                            .filter((s: any) => s.subject_type === 'major')
                                                                            .map((s: any) => (
                                                                                <option key={s.id} value={s.id}>
                                                                                    {s.subject_code} - {s.subject_name}
                                                                                </option>
                                                                            ))}
                                                                    </select>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* ========================= */}
                                        {/* 🌞 SUMMER (ONLY 3RD YEAR) */}
                                        {/* ========================= */}
                                        {year === 3 && (
                                            <div className="mt-6 border rounded-xl p-5 bg-gray-50">

                                                <h4 className="font-semibold text-sm mb-3">
                                                    SUMMER (OJT)
                                                </h4>

                                                {(() => {

                                                    const data = semesters?.[3] || {
                                                        major: [],
                                                        minor: []
                                                    }

                                                    return (
                                                        <div className="space-y-2 text-sm">

                                                            {[...data.major, ...data.minor].map((sub: any) => (
                                                                <div key={sub.id} className="flex justify-between">
                                                                    <span>
                                                                        <b>{sub.subject.subject_code}</b> - {sub.subject.subject_name}
                                                                    </span>

                                                                    {editMode && (
                                                                        <button
                                                                            onClick={() => deleteCurriculum(sub.id)}
                                                                            className="text-red-400"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {editMode && (
                                                                <select
                                                                    className="w-full text-xs border rounded mt-2"
                                                                    onChange={(e) =>
                                                                        submitInline(e.target.value, year, 3)
                                                                    }
                                                                >
                                                                    <option value="">+ Add OJT Subject</option>
                                                                    {subjects.map((s: any) => (
                                                                        <option key={s.id} value={s.id}>
                                                                            {s.subject_code} - {s.subject_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            )}

                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )}

                                    </div>
                                )
                            })}

                        </div>
                    </>
                )}

            </div>
        </AppLayout>
    )
}