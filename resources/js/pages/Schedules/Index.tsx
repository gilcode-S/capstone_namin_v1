import { Head, usePage, router } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import AppLayout from '@/layouts/app-layout'

export default function Index() {

    const {
        schedules = [],
        rooms_grouped = {},
        rooms_flat = [],
        timeslots = [],
        summary = {},
        departments = [],
        filters = {},
    } = usePage().props as any

    const [tab, setTab] = useState<'grid' | 'section' | 'teacher'>('grid')

    const [form, setForm] = useState({
        department_id: filters.department_id || '',
        day: filters.day || '',
        building: filters.building || '',
        floor: filters.floor || '',
        shift: filters.shift || '',
    })

    // ================= AUTO SUBMIT FILTER =================
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get('/schedules', form, {
                preserveState: true,
                replace: true,
            })
        }, 400) // debounce (prevents spam requests)

        return () => clearTimeout(timeout)
    }, [form])

    // ================= HARD-CODED DAYS =================
    const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ]

    const shifts = ['Morning', 'Afternoon', 'Evening']

    // ================= SHIFT DETECTION =================
    const getPeriod = (time: string) => {
        if (!time) return 'Morning'

        let hour = 0

        // handles "HH:MM:SS" or "HH:MM AM/PM"
        if (time.includes('AM') || time.includes('PM')) {
            const [h, mod] = time.split(' ')
            hour = parseInt(h.split(':')[0])

            if (mod === 'PM' && hour !== 12) hour += 12
            if (mod === 'AM' && hour === 12) hour = 0

        } else {
            hour = parseInt(time.split(':')[0])
        }

        if (hour >= 6 && hour < 12) return 'Morning'
        if (hour >= 12 && hour < 18) return 'Afternoon'
        return 'Evening'
    }

    // ================= SCHEDULE LOOKUP MAP =================
    const scheduleMap: any = {}

    schedules.forEach((s: any) => {
        if (!s?.timeslot || !s?.room) return

        const key =
            `${s.timeslot.day_of_week}-${s.timeslot.start_time}-${s.room.room_name}`

        scheduleMap[key] = s
    })

    const formatTime = (time: string) => {
        if (!time) return ''

        const [hour, minute] = time.split(':')
        let h = parseInt(hour)

        const ampm = h >= 12 ? 'PM' : 'AM'

        if (h > 12) h = h - 12
        if (h === 0) h = 12

        return `${h}:${minute ?? '00'} ${ampm}`
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Schedules", href: "/schedules" }]}>

            <Head title="Schedules" />

            <div className="p-6 space-y-6 bg-[#f5f7f6] min-h-screen">

                {/* ================= SUMMARY ================= */}
                <div className="bg-white rounded-xl p-6 border">
                    <div className="grid grid-cols-4 gap-4">
                        <Card title="Total Classes" value={summary.total_classes ?? 0} />
                        <Card title="Weekly Hours" value={summary.weekly_hours ?? 0} />
                        <Card title="Active Rooms" value={summary.active_rooms ?? 0} />
                        <Card title="Sections" value={summary.total_sections ?? 0} />
                    </div>
                </div>

                {/* ================= TABS ================= */}
                <div className="bg-gray-200 rounded-full p-1 flex">
                    {['grid', 'section', 'teacher'].map((t: any) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-full text-sm transition ${tab === t
                                ? 'bg-white shadow font-semibold'
                                : 'text-gray-500'
                                }`}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* ================= FILTERS (TAB AWARE) ================= */}
                <div className="bg-white p-4 rounded-xl border grid grid-cols-5 gap-3">

                    {/* ================= GRID FILTERS ================= */}
                    {tab === 'grid' && (
                        <>
                            {/* Department */}
                            <select
                                className="border p-2 rounded"
                                value={form.department_id}
                                onChange={(e) =>
                                    setForm({ ...form, department_id: e.target.value })
                                }
                            >
                                <option value="">Department</option>
                                {departments.map((d: any) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name ?? d.department_name}
                                    </option>
                                ))}
                            </select>

                            {/* Day */}
                            <select
                                className="border p-2 rounded"
                                value={form.day}
                                onChange={(e) =>
                                    setForm({ ...form, day: e.target.value })
                                }
                            >
                                <option value="">Day</option>
                                {days.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>

                            {/* Building */}
                            <select
                                className="border p-2 rounded"
                                value={form.building}
                                onChange={(e) =>
                                    setForm({ ...form, building: e.target.value })
                                }
                            >
                                <option value="">Building</option>
                                {[...new Set(rooms_flat.map((r: any) => r.building))].map((b: any) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>

                            {/* Floor */}
                            <select
                                className="border p-2 rounded"
                                value={form.floor}
                                onChange={(e) =>
                                    setForm({ ...form, floor: e.target.value })
                                }
                            >
                                <option value="">Floor</option>
                                {[...new Set(rooms_flat.map((r: any) => r.floor))].map((f: any) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>

                            {/* Shift */}
                            <select
                                className="border p-2 rounded"
                                value={form.shift}
                                onChange={(e) =>
                                    setForm({ ...form, shift: e.target.value })
                                }
                            >
                                <option value="">Shift</option>
                                {shifts.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {/* ================= SECTION FILTERS ================= */}
                    {tab === 'section' && (
                        <>
                            <select className="border p-2 rounded col-span-2">
                                <option>Section</option>
                                {/* map sections later */}
                            </select>

                            <select className="border p-2 rounded">
                                <option>Day</option>
                                {days.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>

                            <select className="border p-2 rounded">
                                <option>Shift</option>
                                {shifts.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {/* ================= TEACHER FILTERS ================= */}
                    {tab === 'teacher' && (
                        <>
                            <select className="border p-2 rounded col-span-2">
                                <option>Teacher</option>
                                {/* map faculty later */}
                            </select>

                            <select className="border p-2 rounded">
                                <option>Day</option>
                                {days.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>

                            <select className="border p-2 rounded">
                                <option>Shift</option>
                                {shifts.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </>
                    )}

                </div>

                {/* ================= GRID VIEW ================= */}
                {tab === 'grid' && (
                    <div className="bg-white border rounded-xl overflow-hidden">

                        {/* HEADER */}
                        {/* <div className="p-3 text-center font-bold border-b bg-white">
            SET A
        </div> */}

                        {(() => {

                            const activeShifts =
                                form.shift
                                    ? [form.shift]
                                    : ['Morning', 'Afternoon', 'Evening']

                            return activeShifts.map((shift) => {

                                const filteredTimes = timeslots.filter(
                                    (t: any) => getPeriod(t.start_time) === shift
                                )

                                const filteredRooms = rooms_flat.filter((r: any) => {
                                    if (form.building && r.building !== form.building) return false
                                    if (form.floor && r.floor !== form.floor) return false
                                    return true
                                })

                                if (!filteredTimes.length || !filteredRooms.length) return null

                                return (
                                    <div key={shift} className="border-b">

                                        {/* SHIFT HEADER */}
                                        <div className="bg-gray-100 p-2 font-semibold text-sm">
                                            {shift === 'Morning' && ' MORNING'}
                                            {shift === 'Afternoon' && ' AFTERNOON'}
                                            {shift === 'Evening' && ' EVENING'}
                                        </div>

                                        {/* SCROLL WRAPPER */}
                                        <div className="overflow-x-auto">

                                            <div className="min-w-max">

                                                {/* ================= HEADER ================= */}
                                                <div
                                                    className="grid sticky top-0 z-20 bg-gray-200 border-b"
                                                    style={{
                                                        gridTemplateColumns:
                                                            `120px repeat(${filteredRooms.length}, 180px)`
                                                    }}
                                                >

                                                    {/* TIME HEADER (FIXED LEFT) */}
                                                    <div className="sticky left-0 z-30 bg-gray-200 border-r p-2 text-center font-semibold">
                                                        TIME
                                                    </div>

                                                    {/* ROOM HEADERS */}
                                                    {filteredRooms.map((r: any) => (
                                                        <div
                                                            key={r.id}
                                                            className="p-2 text-center font-semibold border-r"
                                                        >
                                                            {r.room_name}
                                                        </div>
                                                    ))}

                                                </div>

                                                {/* ================= ROWS ================= */}
                                                {filteredTimes.map((timeSlot: any) => (

                                                    <div
                                                        key={timeSlot.id}
                                                        className="grid border-b"
                                                        style={{
                                                            gridTemplateColumns:
                                                                `120px repeat(${filteredRooms.length}, 180px)`
                                                        }}
                                                    >

                                                        {/* TIME COLUMN (FIXED) */}
                                                        <div className="sticky left-0 z-10 bg-white border-r p-2 text-center font-medium shadow-sm">
                                                            {formatTime(timeSlot.start_time)}
                                                        </div>

                                                        {/* ROOM CELLS */}
                                                        {filteredRooms.map((r: any) => {

                                                            const key =
                                                                `${timeSlot.day_of_week}-${timeSlot.start_time}-${r.room_name}`

                                                            const sched = scheduleMap[key]

                                                            return (
                                                                <div
                                                                    key={r.id}
                                                                    className="border-r min-h-[70px] flex items-center justify-center text-xs bg-white"
                                                                >
                                                                    {sched ? (
                                                                        <div className="text-center">
                                                                            <div className="font-semibold">
                                                                                {sched.subject?.subject_code}
                                                                            </div>
                                                                            <div className="text-gray-500">
                                                                                {sched.section?.section_name}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        '—'
                                                                    )}
                                                                </div>
                                                            )
                                                        })}

                                                    </div>
                                                ))}

                                            </div>
                                        </div>

                                    </div>
                                )
                            })

                        })()}

                    </div>
                )}
                {/* ================= OTHER TABS ================= */}
                {tab !== 'grid' && (
                    <div className="bg-white p-6 border rounded-xl">
                        <p className="text-gray-500">View coming soon...</p>
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
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    )
}