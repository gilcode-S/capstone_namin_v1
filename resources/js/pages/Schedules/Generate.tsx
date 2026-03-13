import { Head, router, usePage } from '@inertiajs/react'

import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'

interface Semester {
    id: number
    school_year: number
    term: string
}

interface Version {
    id: number
    version_number: number
    semester: Semester
}

export default function Generate() {

    const { versions } =
        usePage().props as unknown as {

            versions: Version[],
        }
    const [generating, setGenerating] = useState(false)

    const versionId = versions?.[0]?.id

    const generateSchedule = () => {

        if (!versionId) return

        setGenerating(true)

        router.post(`/schedules/generate/${versionId}`, {}, {
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

            <div className="p-6 max-w-xl">

                <div className="flex items-center mb-6">

                    <Sparkles className="mr-3 text-green-500" size={28} />

                    <h1 className="text-2xl font-bold">
                        Generate Schedule
                    </h1>

                </div>

                <div className="bg-white border rounded-lg shadow-sm p-6">

                    <p className="text-gray-600 mb-6">
                        Automatically generate class schedules based on
                        assignments, rooms, and timeslots.
                    </p>

                    <div className='flex items-center gap-5'>

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