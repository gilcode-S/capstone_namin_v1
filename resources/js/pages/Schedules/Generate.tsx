import { Head, router, usePage } from '@inertiajs/react'
import { Loader2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'

interface Semester { id: number; school_year: number; term: string }
interface Version { id: number; version_number: number; semester: Semester }
interface Section { id: number; section_name: string }
interface Subject { id: number; subject_code: string; subject_name: string }
interface Faculty { id: number; first_name: string; last_name: string }
interface Assignment { id: number; section: Section; subject: Subject; faculty: Faculty }
interface Room { id: number; room_name: string }
interface Timeslot {
    id: number
    day_of_week?: string
    start_time?: string
    end_time?: string
    mode?: string | null
    status?: string | null
}

export default function Generate() {
    const { versions, timeslots, rooms, assignments } =
        usePage().props as unknown as {
            versions: Version[]
            timeslots: Timeslot[]
            rooms: Room[]
            assignments: Assignment[]
        }

    const [generating, setGenerating] = useState(false)

    // ✅ FIX: real selected version instead of versions[0]
    const [versionId, setVersionId] = useState<number | null>(null)

    // auto-select latest version (optional but recommended)
    useEffect(() => {
        if (versions?.length > 0 && !versionId) {
            setVersionId(versions[versions.length - 1].id)
        }
    }, [versions])

    const normalizedTimeslots = (timeslots || []).map(t => ({
        id: t.id,
        day_of_week: t.day_of_week || t.day || "Monday",
        start_time: t.start_time || "08:00 AM",
        end_time: t.end_time || "09:00 AM",
        mode: t.mode ?? null,
        status: t.status ?? null,
    }))

    const generateSchedule = () => {
        if (!versionId) {
            alert("Please select a version first")
            return
        }

        setGenerating(true)

        router.post(`/schedules/generate/${versionId}`, {
            assignments,
            rooms,
            timeslots: normalizedTimeslots,
        }, {
            onFinish: () => setGenerating(false),
            onError: () => alert("Failed to generate schedule. Please try again."),
            onSuccess: () => alert("Schedule generated successfully!"),
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

            <div className="p-6 max-w-xl">
                <div className="flex items-center mb-6">
                    <Sparkles className="mr-3 text-green-500" size={28} />
                    <h1 className="text-2xl font-bold">Generate Schedule</h1>
                </div>

                <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
                    <p className="text-gray-600">
                        Automatically generate class schedules based on assignments, rooms, and timeslots.
                    </p>

                    {/* ✅ VERSION SELECTOR FIX */}
                    <div>
                        <label className="text-sm font-medium">Select Version</label>

                        <select
                            className="w-full border p-2 rounded mt-1"
                            value={versionId ?? ""}
                            onChange={(e) => setVersionId(Number(e.target.value))}
                        >
                            <option value="">-- Select Version --</option>
                            {versions.map(v => (
                                <option key={v.id} value={v.id}>
                                    Version {v.version_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={generateSchedule}
                            disabled={generating}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                            {generating && <Loader2 className="animate-spin" size={16} />}
                            {generating ? "Generating..." : "Generate Schedule"}
                        </Button>

                        <Button
                            onClick={resetSchedule}
                            disabled={generating}
                            variant="destructive"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}