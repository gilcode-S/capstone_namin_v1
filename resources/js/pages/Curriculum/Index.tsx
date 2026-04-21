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

    const [extraYears, setExtraYears] = useState<number[]>([])

    const backendYears = Object.keys(curriculum || {}).map(Number)

    const allYears = [...new Set([...backendYears, ...extraYears])].sort(
        (a, b) => a - b
    )

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
                        className="h-10 w-96 px-3 rounded-lg border bg-white"
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
                        className="h-10 w-96 px-3 rounded-lg border bg-white"
                    >
                        <option value="">Select Program</option>
                        {programs.map((p: any) => (
                            <option key={p.id} value={p.id}>
                                {p.program_name}
                            </option>
                        ))}
                    </select>
                </div>
                {!activeDepartment || !activeProgram ? (
                    <div className="text-center text-gray-400 py-20">
                        Please select department and program first
                    </div>
                ) : (
                    <>
                        {/* PROGRAM HEADER */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                {programs.find((p: any) => p.id === activeProgram)?.program_name}
                            </h2>

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

                                        <h3 className="text-lg font-semibold mb-4">
                                            {getYearLabel(year)}
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-6">

                                            {[1, 2].map((sem) => {

                                                const data = semesters?.[sem] || {
                                                    major: [],
                                                    minor: []
                                                }

                                                const totalUnits = [...data.major, ...data.minor]
                                                    .reduce((sum: number, s: any) =>
                                                        sum + (s.subject.units || 0), 0)

                                                const maxRows = Math.max(data.minor.length, data.major.length)

                                                return (
                                                    <div key={sem} className="border rounded-xl p-5 bg-gray-50">

                                                        <h4 className="font-medium text-sm mb-4">
                                                            {sem === 1 ? 'FIRST SEMESTER' : 'SECOND SEMESTER'}
                                                        </h4>

                                                        {/* HEADER */}
                                                        <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 border-b pb-2 mb-2">
                                                            <div>Minor Subject</div>
                                                            <div className="text-center">Unit</div>
                                                            <div>Major Subject</div>
                                                            <div className="text-center">Unit</div>
                                                        </div>

                                                        {/* ROWS (paired alignment) */}
                                                        <div className="space-y-[6px] text-sm">

                                                            {Array.from({ length: maxRows }).map((_, i) => {

                                                                const minor = data.minor[i]
                                                                const major = data.major[i]

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        className="grid grid-cols-4 items-center py-[2px] leading-tight tracking-tight"
                                                                    >
                                                                        {/* MINOR */}
                                                                        <div className="pr-2">
                                                                            {minor
                                                                                ? `${minor.subject.subject_code}  -  ${minor.subject.subject_name}`
                                                                                : ''}
                                                                        </div>

                                                                        <div className="text-center text-gray-500 tabular-nums">
                                                                            {minor?.subject.units || ''}
                                                                        </div>

                                                                        {/* MAJOR */}
                                                                        <div className="pr-2">
                                                                            {major
                                                                                ? `${major.subject.subject_code} - ${major.subject.subject_name}`
                                                                                : ''}
                                                                        </div>

                                                                        <div className="text-center text-gray-500 tabular-nums">
                                                                            {major?.subject.units || ''}
                                                                        </div>

                                                                        {/* DELETE buttons (kept logic, invisible placement safe) */}
                                                                        {editMode && minor && (
                                                                            <button
                                                                                onClick={() => deleteCurriculum(minor.id)}
                                                                                className="text-red-400 text-xs col-span-2"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        )}

                                                                        {editMode && major && (
                                                                            <button
                                                                                onClick={() => deleteCurriculum(major.id)}
                                                                                className="text-red-400 text-xs col-span-2"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>

                                                        {/* ADD SELECTS */}
                                                        {editMode && (
                                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                                <select
                                                                    className="text-xs border rounded"
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

                                                                <select
                                                                    className="text-xs border rounded"
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
                                                            </div>
                                                        )}

                                                        {/* TOTAL */}
                                                        <div className="mt-4 text-xs text-gray-500 border-t pt-2">
                                                            Total Units: <b>{totalUnits}</b>
                                                        </div>

                                                    </div>
                                                )
                                            })}
                                        </div>
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