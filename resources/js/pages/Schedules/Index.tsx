import { Head, usePage } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'

export default function Index() {

    const {
        schedules = [],
        rooms = [],
        timeslots = [],
        summary = {},
    } = usePage().props as any

    const [tab, setTab] = useState<'grid' | 'section' | 'teacher'>('grid')

    const roomsByBuilding = rooms

    const uniqueTimes = [...new Set(timeslots.map((t: any) => t.start_time))]
    const days = [...new Set(timeslots.map((t: any) => t.day_of_week))]

    // ================= TIME GROUPING =================
    const getPeriod = (time: string) => {
        if (!time) return 'Morning'

        const [hourPart, modifier] = time.split(' ')
        let hour = parseInt(hourPart?.split(':')[0] ?? '0')

        if (modifier === 'PM' && hour !== 12) hour += 12
        if (modifier === 'AM' && hour === 12) hour = 0

        if (hour < 12) return 'Morning'
        if (hour < 17) return 'Afternoon'
        return 'Evening'
    }

    const groupedTimes = {
        Morning: uniqueTimes.filter(t => getPeriod(t) === 'Morning'),
        Afternoon: uniqueTimes.filter(t => getPeriod(t) === 'Afternoon'),
        Evening: uniqueTimes.filter(t => getPeriod(t) === 'Evening'),
    }

    // ================= FAST LOOKUP =================
    const scheduleMap: any = {}

    schedules.forEach((s: any) => {
        if (!s?.timeslot || !s?.room) return

        const key = `${s.timeslot.day_of_week}-${s.timeslot.start_time}-${s.room.room_name}`
        scheduleMap[key] = s
    })

    return (
        <AppLayout breadcrumbs={[{ title: "Schedules", href: "/schedules" }]}>

            <Head title="Schedules" />

            <div className="p-6 space-y-6 bg-[#f5f7f6] min-h-screen">

                {/* ================= HEADER ================= */}
                <div className="bg-white rounded-xl p-6 border">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold">Schedule Viewer</h1>
                            <p className="text-sm text-gray-500">
                                View and analyze the optimized class schedules
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline">Export PDF</Button>
                            <Button variant="outline">Advanced Filters</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <Card title="Total Classes" value={summary.total_classes ?? 0} />
                        <Card title="Weekly Hours" value={summary.weekly_hours ?? 0} />
                        <Card title="Active Rooms" value={summary.active_rooms ?? 0} />
                        <Card title="Total Section" value={summary.total_sections ?? 0} />
                    </div>
                </div>

                {/* ================= TABS ================= */}
                <div className="bg-gray-200 rounded-full p-1 flex">
                    {['grid', 'section', 'teacher'].map((t: any) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-full text-sm transition ${
                                tab === t
                                    ? 'bg-white shadow font-semibold'
                                    : 'text-gray-500'
                            }`}
                        >
                            {t === 'grid' ? 'GRID' : t === 'section' ? 'By Section' : 'By Teacher'}
                        </button>
                    ))}
                </div>

                {/* ================= GRID ================= */}
                {tab === 'grid' && (
                    <div className="bg-white border rounded-xl overflow-auto">

                        <div className="min-w-max">

                            <div className="sticky top-0 z-40 bg-white border-b text-center font-semibold py-3">
                                SET A
                            </div>

                            {Object.entries(roomsByBuilding).map(([building, rooms]: any) => (

                                <div key={building} className="border-b">

                                    <div className="sticky top-[48px] z-30 bg-gray-50 border-b text-center py-2 font-semibold">
                                        BUILDING {building}
                                    </div>

                                    {days.map(day => (

                                        <div key={day} className="border-b">

                                            <div
                                                className="grid sticky top-[80px] z-20 bg-gray-100 border-b"
                                                style={{
                                                    gridTemplateColumns: `120px repeat(${rooms.length}, 180px)`
                                                }}
                                            >
                                                <div className="sticky left-0 z-30 bg-gray-100 border-r p-2 font-semibold text-center">
                                                    {day.toUpperCase()}
                                                </div>

                                                {rooms.map((r: any) => (
                                                    <div key={r.id} className="border-r p-2 text-center font-medium">
                                                        {r.room_name}
                                                    </div>
                                                ))}
                                            </div>

                                            {Object.entries(groupedTimes).map(([period, times]: any) => (

                                                <div key={period}>

                                                    <div
                                                        className="grid bg-gray-200 border-b text-xs font-semibold"
                                                        style={{
                                                            gridTemplateColumns: `120px repeat(${rooms.length}, 180px)`
                                                        }}
                                                    >
                                                        <div className="sticky left-0 z-20 bg-gray-200 border-r p-2 text-center">
                                                            {period.toUpperCase()}
                                                        </div>

                                                        {rooms.map((r: any) => (
                                                            <div key={r.id} className="border-r" />
                                                        ))}
                                                    </div>

                                                    {times.map((time: string) => (

                                                        <div
                                                            key={time}
                                                            className="grid border-b"
                                                            style={{
                                                                gridTemplateColumns: `120px repeat(${rooms.length}, 180px)`
                                                            }}
                                                        >

                                                            <div className="sticky left-0 z-10 bg-white border-r p-2 text-sm text-center">
                                                                {time}
                                                            </div>

                                                            {rooms.map((r: any) => {

                                                                const sched = scheduleMap[`${day}-${time}-${r.room_name}`]

                                                                return (
                                                                    <div
                                                                        key={r.id}
                                                                        className="border-r p-2 min-h-[80px] flex flex-col justify-center items-center text-xs"
                                                                    >
                                                                        {sched ? (
                                                                            <>
                                                                                <div className="font-semibold text-center">
                                                                                    {sched.faculty?.first_name ?? '—'}
                                                                                </div>

                                                                                <div className="text-gray-500 text-[10px] text-center">
                                                                                    {sched.section?.section_name ?? '—'}
                                                                                </div>

                                                                                <div className="text-[9px] text-gray-400 text-center">
                                                                                    {sched.subject?.subject_code ?? '—'}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-gray-300">—</span>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}

                                                        </div>
                                                    ))}

                                                </div>
                                            ))}

                                        </div>
                                    ))}

                                </div>
                            ))}

                        </div>
                    </div>
                )}

                {/* ================= SECTION TABLE ================= */}
                {tab === 'section' && (
                    <div className="bg-white border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Section</th>
                                    <th className="p-2 text-left">Subject</th>
                                    <th className="p-2 text-left">Faculty</th>
                                    <th className="p-2 text-left">Room</th>
                                    <th className="p-2 text-left">Time</th>
                                </tr>
                            </thead>

                            <tbody>
                                {schedules.map((s: any) => (
                                    <tr key={s.id} className="border-t">
                                        <td className="p-2">{s.section?.section_name ?? '-'}</td>
                                        <td className="p-2">{s.subject?.subject_code ?? '-'}</td>
                                        <td className="p-2">{s.faculty?.first_name ?? '-'}</td>
                                        <td className="p-2">{s.room?.room_name ?? '-'}</td>
                                        <td className="p-2">
                                            {s.timeslot?.day_of_week} {s.timeslot?.start_time}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </AppLayout>
    )
}

/* ================= CARD ================= */
function Card({ title, value }: any) {
    return (
        <div className="border rounded-xl p-4 bg-gray-50">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
    )
}