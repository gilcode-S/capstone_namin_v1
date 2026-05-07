import { Head, router, usePage } from '@inertiajs/react'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'

export default function Generate() {
    const { versions, timeSlots, sections } = usePage().props as any

    const [generating, setGenerating] = useState(false)
    const [versionId, setVersionId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false);
    // MODALS
    const [showConfirm, setShowConfirm] = useState(false)
    const [showInputs, setShowInputs] = useState(false)

    // INPUTS
    const [academicYear, setAcademicYear] = useState("2025-2026")
    const [semester, setSemester] = useState("1st")
    const [versionName, setVersionName] = useState("")
    const [effectiveDate, setEffectiveDate] = useState("")

    const [sectionId, setSectionId] = useState<number | null>(null)
    // useEffect(() => {
    //     if (sections?.length > 0 && !sectionId) {
    //         setSectionId(sections[0].id)
    //     }
    // }, [sections])

    // console.log(sections)


    // ✅ LOCK STATE (OUTSIDE ACTION)
    const [engines, setEngines] = useState({
        room: true,
        curriculum: true,
        teacher: true
    })

    const toggleLock = (key: 'room' | 'curriculum' | 'teacher') => {
        setEngines(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    useEffect(() => {
        if (versions?.length > 0 && !versionId) {
            setVersionId(versions[versions.length - 1].id)
        }
    }, [versions])

    const generateSchedule = () => {
        if (!academicYear || !semester || !effectiveDate) {
            alert("Please complete all fields")
            return
        }

        setGenerating(true)

        router.post(`/generate-schedule`, {
            academic_year: academicYear,
            semester: semester,
            effective_date: effectiveDate
        }, {
            onFinish: () => setGenerating(false)
        })
    }

    const resetSchedule = () => {
        if (!versionId) return

        setGenerating(true)

        router.post(`/schedules/reset/${versionId}`, {}, {
            onFinish: () => setGenerating(false)
        })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Generate Schedule", href: "/generate-schedule" }]}>

            <Head title="Generate Schedule" />

            <div className="p-6 bg-white min-h-screen">

                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">
                        Schedule Generator
                    </h1>
                    <p className="text-sm text-gray-500">
                        Generate optimized schedules using CP-SAT engine
                    </p>
                </div>

                {/* LEFT / RIGHT LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* ================= LEFT SIDE ================= */}
                    <div className="md:col-span-2 border rounded-xl p-5 space-y-3">

                        <h3 className="font-semibold">Setup Controller</h3>

                        {/* ROOM */}
                        <div className="flex items-center justify-between border rounded-lg p-4">

                            {/* ACTION AREA */}
                            <div
                                onClick={() => {
                                    if (engines.room) {
                                        router.post('/setup/lock-rooms')
                                    }
                                }}
                                className={`flex-1 cursor-pointer ${!engines.room ? 'opacity-50' : ''}`}
                            >
                                <p className="font-medium">⚡ Room Timeslot Engine</p>
                                <p className="text-xs text-gray-500">Assigns time slots to rooms.</p>
                            </div>

                            {/* LOCK (OUTSIDE ACTION) */}
                            <button
                                onClick={() => toggleLock('room')}
                                className="ml-3 text-lg"
                            >
                                {engines.room ? '🔓' : '🔒'}
                            </button>

                        </div>

                        {/* CURRICULUM */}
                        <div className="border rounded-lg p-4 space-y-3">

                            <div>
                                <label className="text-sm font-medium">Select Section</label>

                                <select
                                    value={sectionId ?? ''}
                                    onChange={(e) => setSectionId(Number(e.target.value))}
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                >
                                    <option value="">
                                        Select Section
                                    </option>

                                    {sections?.map((section: any) => (
                                        <option key={section.id} value={section.id}>
                                            {section.section_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div
                                    onClick={() => {
                                        if (engines.curriculum && sectionId) {
                                            router.post('/setup/fetch-curriculum', {
                                                section_id: sectionId
                                            })
                                        } else {
                                            alert("Please select a section first.")
                                        }
                                    }}
                                    className={`flex-1 cursor-pointer ${!engines.curriculum ? 'opacity-50' : ''}`}
                                >
                                    <p className="font-medium">📚 Curriculum Fetch Engine</p>
                                    <p className="text-xs text-gray-500">Assigns subjects to sections.</p>
                                </div>

                                <button
                                    onClick={() => toggleLock('curriculum')}
                                    className="ml-3 text-lg"
                                >
                                    {engines.curriculum ? '🔓' : '🔒'}
                                </button>
                            </div>

                        </div>
                        <div className="border rounded-lg p-4 space-y-3">
                            <label className="text-sm font-medium">Select Section</label>

                            <select
                                value={sectionId ?? ''}
                                onChange={(e) => setSectionId(Number(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 mt-1"
                            >
                                <option value="">
                                    Select Section
                                </option>

                                {sections?.map((section: any) => (
                                    <option key={section.id} value={section.id}>
                                        {section.section_name}
                                    </option>
                                ))}
                            </select>
                            <div
                                onClick={() => {
                                    if (sectionId) {
                                        router.post(`/generate-units/${sectionId}`)
                                    } else {
                                        alert("Select section first")
                                    }
                                }}
                                className="cursor-pointer border p-4 rounded-lg"
                            >
                                <p className="font-medium">🧩 Generate Scheduling Units</p>
                                <p className="text-xs text-gray-500">
                                    Splits subjects into schedulable meetings
                                </p>

                            </div>
                        </div>

                        {/* TEACHER */}
                        <div className="flex items-center justify-between border rounded-lg p-4">

                            <div
                                onClick={() => {
                                    if (engines.teacher) {
                                        router.post('/setup/rank-teachers', {
                                            subject_id: 1 // 🔥 TEMP TEST
                                        })
                                    }
                                }}
                                className={`flex-1 cursor-pointer ${!engines.teacher ? 'opacity-50' : ''}`}
                            >
                                <p className="font-medium">👨‍🏫 Teachers Ranking Engine</p>
                                <p className="text-xs text-gray-500">Evaluates teacher competency.</p>
                            </div>

                            <button
                                onClick={() => toggleLock('teacher')}
                                className="ml-3 text-lg"
                            >
                                {engines.teacher ? '🔓' : '🔒'}
                            </button>

                        </div>

                    </div>

                    {/* ================= RIGHT SIDE ================= */}
                    <div className="border rounded-xl p-5 space-y-5 shadow-sm">

                        <div className="text-lg font-medium">
                            ⚡ Generate Schedule
                        </div>

                        <div className="flex flex-col items-center gap-3">

                            <div className="w-12 h-12 rounded-full border flex items-center justify-center">
                                🕒
                            </div>

                            <p className="text-sm text-gray-600">
                                Ready to optimize
                            </p>

                            <div className="flex gap-3 mt-2">

                                <Button
                                    onClick={() => setShowInputs(true)}
                                    className="bg-black text-white px-4 py-2 text-sm"
                                >
                                    Generate
                                </Button>

                                <Button
                                    onClick={resetSchedule}
                                    disabled={generating || !versionId}
                                    className="bg-red-500 text-white px-4 py-2 text-sm"
                                >
                                    Reset
                                </Button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================= MODALS (UNCHANGED) ================= */}
                {showConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
                            <h3 className="font-semibold text-lg">Confirm Generation</h3>

                            <p className="text-sm text-gray-600">
                                The system will generate an optimized schedule using CP-SAT engine.
                            </p>

                            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                <p><b>Year:</b> {academicYear}</p>
                                <p><b>Semester:</b> {semester}</p>
                                <p><b>Effective Date:</b> {effectiveDate}</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirm(false)
                                        setShowInputs(true)
                                    }}
                                    className="border px-4 py-2 rounded-lg text-sm"
                                >
                                    Edit Inputs
                                </button>

                                <button
                                    onClick={() => {
                                        setShowConfirm(false)
                                        generateSchedule()
                                    }}
                                    className="bg-black text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showInputs && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

                            <h3 className="font-semibold text-lg">Edit Inputs</h3>

                            <div>
                                <label className="text-sm">Academic Year</label>
                                <input
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm">Semester</label>
                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                >
                                    <option>1st</option>
                                    <option>2nd</option>
                                    <option>Summer</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm">Effective Date</label>
                                <input
                                    type="date"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm">Version Name (optional)</label>
                                <input
                                    value={versionName}
                                    onChange={(e) => setVersionName(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                />
                            </div>

                            <div className="flex justify-end gap-3">

                                <button
                                    onClick={() => setShowInputs(false)}
                                    className="border px-4 py-2 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        setShowInputs(false)
                                        setShowConfirm(true)
                                    }}
                                    className="bg-black text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    Save
                                </button>

                            </div>

                        </div>
                    </div>
                )}

            </div>

        </AppLayout>
    )
}