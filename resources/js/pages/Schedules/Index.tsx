import { Head, usePage, router } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function Index() {

    const {
        schedules = [],
        sections = [],
        rooms_flat = [],
        timeslots = [],
        summary = {},
        departments = [],
        filters = {},
        section_schedules = {},
        teacher_schedules = {},
        faculties = [],
        teachers = []
    } = usePage().props as any

    const [tab, setTab] = useState<'grid' | 'section' | 'teacher'>('grid')
    const [setMode, setSetMode] = useState<'A' | 'B'>('A')
    const [gridKey, setGridKey] = useState(0)
    const [selectedSection, setSelectedSection] = useState<any>(null)
    const [sectionModalOpen, setSectionModalOpen] = useState(false)
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
    const [teacherModalOpen, setTeacherModalOpen] = useState(false)
    const [form, setForm] = useState({
        department_id: filters.department_id || '',
        day: filters.day || '',
        building: filters.building || '',
        floor: filters.floor || '',
        shift: filters.shift || '',
    })

    const sectionMap: any = {}

    schedules.forEach((s: any) => {
        if (!s?.timeslot || !s?.room || !s?.section) return

        const key = `${s.section.section_name}-${s.timeslot.day_of_week}-${s.timeslot.start_time}`

        sectionMap[key] = s
    })

    const groupedTeacherSchedule =
        selectedTeacher
            ? (teacher_schedules[selectedTeacher.id] || []).reduce((acc, s) => {
                if (!acc[s.day]) acc[s.day] = []
                acc[s.day].push(s)
                return acc
            }, {})
            : {}
    const handleFilterChange = (key, value) => {
        const updated = {
            ...filters,
            [key]: value,
        };

        router.get(route('schedules.index'), updated, {
            preserveState: true,
            replace: true,
        });
    };


    // ================= AUTO SUBMIT FILTER =================
    useEffect(() => {
        if (tab !== 'grid') return

        const timeout = setTimeout(() => {
            router.get('/schedules', form, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['schedules', 'summary', 'rooms_flat', 'timeslots']
            })
        }, 400)

        return () => clearTimeout(timeout)
    }, [form])

    useEffect(() => {
        setGridKey(prev => prev + 1)
    }, [schedules.length])

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
    const groupedSectionSchedule =
        selectedSection
            ? (section_schedules[selectedSection.section_id] || []).reduce((acc, s) => {
                if (!acc[s.day]) acc[s.day] = []
                acc[s.day].push(s)
                return acc
            }, {})
            : {}
    const [search, setSearch] = useState(filters.section || '');

    useEffect(() => {
        const delay = setTimeout(() => {
            handleFilterChange('section', search);
        }, 400); // 400ms delay

        return () => clearTimeout(delay);
    }, [search]);
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
                            <Input
                                placeholder="Search Section..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border p-2 rounded col-span-2"
                            />

                            <select
                                className="border p-2 rounded"
                                value={filters.shift || ''}
                                onChange={(e) => handleFilterChange('shift', e.target.value)}
                            >
                                <option value="">Shift</option>
                                {shifts.map((s) => (
                                    <option key={s} value={s}>{s}</option>
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
                    <div key={gridKey} className="bg-white border rounded-xl overflow-hidden">

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
                {tab === 'section' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {sections.length === 0 ? (
                            <div className="text-gray-500">
                                No sections available
                            </div>
                        ) : (
                            sections.map((sec: any) => (
                                <div
                                    key={sec.section_id}
                                    onClick={() => {
                                        setSelectedSection(sec)
                                        setSectionModalOpen(true)
                                    }}
                                    className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                                >

                                    {/* SECTION NAME */}
                                    <div className="text-lg font-bold text-gray-800">
                                        {sec.section_name}
                                    </div>

                                    {/* PROGRAM */}
                                    <div className="text-sm text-gray-500">
                                        {sec.program_name}
                                    </div>

                                    {/* STATS ROW */}
                                    <div className="mt-4 flex justify-between">

                                        {/* SUBJECTS */}
                                        <div>
                                            <div className="text-xs text-gray-400">Subjects</div>
                                            <div className="text-lg font-semibold">
                                                {sec.total_subjects}
                                            </div>
                                        </div>

                                        {/* UNITS */}
                                        <div>
                                            <div className="text-xs text-gray-400">Units</div>
                                            <div className="text-lg font-semibold text-blue-600">
                                                {sec.total_units}
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            ))
                        )}

                    </div>
                )}
                {tab === 'teacher' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {teachers.length === 0 ? (
                            <div className="text-gray-500">
                                No teachers available
                            </div>
                        ) : (
                            teachers.map((t: any) => (
                                <div
                                    key={t.id}
                                    onClick={() => {
                                        // optional: open modal later
                                        console.log(t)
                                    }}
                                    className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                                >

                                    {/* NAME */}
                                    <div className="text-lg font-bold text-gray-800">
                                        {t.name}
                                    </div>

                                    {/* DEPARTMENT */}
                                    <div className="text-sm text-gray-500">
                                        {t.department}
                                    </div>

                                    {/* STATS ROW */}
                                    <div className="mt-4 flex justify-between">

                                        {/* SUBJECTS */}
                                        <div>
                                            <div className="text-xs text-gray-400">Subjects</div>
                                            <div className="text-lg font-semibold">
                                                {t.total_subjects}
                                            </div>
                                        </div>

                                        {/* UNITS */}
                                        <div>
                                            <div className="text-xs text-gray-400">Units</div>
                                            <div className="text-lg font-semibold text-blue-600">
                                                {t.total_units}
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            ))
                        )}

                    </div>
                )}

                <Dialog
                    open={sectionModalOpen}
                    onOpenChange={(open) => {
                        setSectionModalOpen(open)
                        if (!open) setSelectedSection(null)
                    }}
                >
                    <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 rounded-2xl">

                        {selectedSection && (
                            <div className="flex flex-col h-full bg-white">

                                {/* HEADER */}
                                <div className="p-6 border-b">
                                    <h2 className="text-2xl font-bold">
                                        {selectedSection.section_name}
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Program: {selectedSection.program_name}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Subjects: {selectedSection.total_subjects}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Units: {selectedSection.total_units}
                                    </p>
                                </div>

                                {/* BODY */}
                                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                                    {Object.keys(groupedSectionSchedule).length === 0 && (
                                        <div className="text-center text-gray-500">
                                            No schedule assigned
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {Object.entries(groupedSectionSchedule).map(([day, schedules]) => (
                                            <div key={day} className="bg-white rounded-xl border">

                                                {/* DAY */}
                                                <div className="bg-gray-100 px-4 py-2 font-semibold">
                                                    {day}
                                                </div>

                                                {schedules.map((s: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="flex justify-between px-4 py-3 border-t text-sm"
                                                    >
                                                        <span>
                                                            {formatTime(s.start_time)} - {formatTime(s.end_time)}
                                                        </span>

                                                        <span className="font-medium">
                                                            {s.subject}
                                                        </span>

                                                        <span className="text-gray-500">
                                                            {s.room}
                                                        </span>

                                                        <span className="text-gray-400 text-xs">
                                                            {s.teacher}
                                                        </span>
                                                    </div>
                                                ))}

                                            </div>
                                        ))}
                                    </div>

                                </div>

                            </div>
                        )}

                    </DialogContent>
                </Dialog>



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