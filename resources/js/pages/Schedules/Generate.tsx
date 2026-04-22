import { Head, router, usePage } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'

export default function Generate() {
    const { versions, timeslots, rooms, assignments } = usePage().props as any

    const [generating, setGenerating] = useState(false)
    const [versionId, setVersionId] = useState<number | null>(null)

    // MODALS
    const [showConfirm, setShowConfirm] = useState(false)
    const [showInputs, setShowInputs] = useState(false)

    // INPUTS
    const [academicYear, setAcademicYear] = useState("2025-2026")
    const [semester, setSemester] = useState("1st Semester")
    const [versionName, setVersionName] = useState("")

    useEffect(() => {
        if (versions?.length > 0 && !versionId) {
            setVersionId(versions[versions.length - 1].id)
        }
    }, [versions])

    const normalizedTimeslots = (timeslots || []).map((t: any) => ({
        id: t.id,
        day_of_week: t.day_of_week || "Monday",
        start_time: t.start_time || "08:00 AM",
        end_time: t.end_time || "09:00 AM",
    }))

    const generateSchedule = () => {
        if (!versionId) return alert("Select version first")

        setGenerating(true)

        router.post(`/schedules/generate/${versionId}`, {
            assignments,
            rooms,
            timeslots: normalizedTimeslots,
        }, {
            onFinish: () => setGenerating(false),
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

            {/* PAGE */}
            <div className="p-6 bg-white min-h-screen flex flex-col items-start">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold">
                        Schedule Generator
                    </h1>
                    <p className="text-sm text-gray-500">
                        Generate optimized schedules using CP-SAT engine
                    </p>
                </div>

                {/* MAIN CARD */}
                <div className="bg-white border rounded-xl p-5 w-full max-w-md text-center space-y-5 shadow-sm">

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
                                onClick={() => {
                                    if (!versionId) {
                                        setShowInputs(true)
                                        return
                                    }
                                    setShowConfirm(true)
                                }}
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

                {/* ================= CONFIRM MODAL ================= */}
                {showConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

                            <h3 className="font-semibold text-lg">
                                Confirm Generation
                            </h3>

                            <p className="text-sm text-gray-600">
                                The system will generate an optimized schedule using CP-SAT engine.
                            </p>

                            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                <p><b>Year:</b> {academicYear}</p>
                                <p><b>Semester:</b> {semester}</p>
                                <p><b>Version Name:</b> {versionName || "—"}</p>
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

                {/* ================= INPUT MODAL ================= */}
                {showInputs && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

                            <h3 className="font-semibold text-lg">
                                Edit Inputs
                            </h3>

                            {/* VERSION (MOVED HERE) */}
                            <div>
                                <label className="text-sm">Version</label>
                                <select
                                    value={versionId ?? ""}
                                    onChange={(e) => setVersionId(Number(e.target.value))}
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                >
                                    <option value="">Select version</option>
                                    {versions.map((v: any) => (
                                        <option key={v.id} value={v.id}>
                                            Version {v.version_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                    <option>1st Semester</option>
                                    <option>2nd Semester</option>
                                    <option>Summer</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm">Version Name</label>
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