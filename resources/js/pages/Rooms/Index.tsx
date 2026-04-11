import { Head, router, usePage } from '@inertiajs/react'

import { Plus, Pencil, Trash2, Building } from 'lucide-react'
import { useState, useEffect } from 'react'
import Pagination from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,

} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'

interface Department {
    id: number
    department_name: string
}
interface TimeSlot {
    day_of_week: string
    start_time: string
    end_time: string
}
interface Schedule {
    id: number
    timeslot: TimeSlot
}
interface Room {
    id: number
    room_name: string


    resource_type: 'classroom' | 'laboratory' | 'auditorium'
    resource_status: 'available' | 'occupied' | 'maintenance'

    capacity: number

    building?: string
    floor?: string

    equipment?: string[]

    department?: Department

    schedules?: Schedule[]


    room_type?: string
    status?: string
}
const emptyForm = {
    room_name: '',
    resource_type: '',
    capacity: '',
    department_id: '',
    building: '',
    floor: '',
    equipment_text: '',
    resource_status: 'available'
}

export default function Index() {
    const { rooms, departments, stats, filters } = usePage().props as unknown as {
        rooms: {
            data: Room[],
            links: any[],
        },
        departments: Department[],
        stats: {
            total: number
            available: number
            occupied: number
            maintenance: number
        }
    }


    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [loading, setLoading] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState(filters?.type || '')
    const [activeTab, setActiveTab] = useState<'all' | 'idle'>('all')
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null)
    const [viewOpen, setViewOpen] = useState(false)

    useEffect(() => {
        setStatusFilter(filters?.status || '')
    }, [filters])
    /* OPEN CREATE */
    const handleOpen = () => {
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setOpen(true)
    }

    /* OPEN EDIT */
    const handleOpenEdit = (room: Room) => {
        setForm({
            room_name: room.room_name,
            resource_type: room.resource_type || room.room_type,
            capacity: room.capacity,
            department_id: room.department?.id || '',
            building: room.building || '',
            floor: room.floor || '',
            equipment_text: (room.equipment || []).join(', '),
            resource_status: room.resource_status || room.status
        })

        setIsEdit(true)
        setEditId(room.id)
        setOpen(true)
    }

    /* CLOSE */
    const handleClose = () => {
        setForm(emptyForm)
        setIsEdit(false)
        setEditId(null)
        setOpen(false)
    }

    /* INPUT CHANGE */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value)

        router.get('/rooms', {
            status: value,
            type: typeFilter
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }
    const handleTabFilter = (value: string) => {
        setTabFilter(value)

        router.get('/rooms', {
            tab: value,
            type: typeFilter
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }


    const isRoomOccupiedNow = (room: any) => {
        const now = new Date()

        return room.schedules?.some((s: any) => {
            const today = now.toLocaleString('en-US', { weekday: 'long' })

            if (s.timeslot.day_of_week !== today) return false

            const currentTime = new Date(
                `1970-01-01T${now.toTimeString().slice(0, 8)}`
            )

            const start = new Date(`1970-01-01T${s.timeslot.start_time}`)
            const end = new Date(`1970-01-01T${s.timeslot.end_time}`)

            return currentTime >= start && currentTime <= end
        })
    }

    const getNextSchedule = (room: any) => {
        const now = new Date()
        const currentTime = new Date(`1970-01-01T${now.toTimeString().slice(0, 8)}`)

        const upcoming = room.schedules
            ?.map((s: any) => {
                const start = new Date(`1970-01-01T${s.timeslot.start_time}`)
                return { ...s, start }
            })
            .filter((s: any) => s.start > currentTime)
            .sort((a: any, b: any) => a.start - b.start)

        return upcoming?.[0]
    }

    const groupSchedulesByDay = (room: any) => {
        const days: any = {}

        room.schedules?.forEach((s: any) => {
            const day = s.timeslot.day_of_week

            if (!days[day]) days[day] = []
            days[day].push(s.timeslot)
        })

        return days
    }

    const getAvailableRanges = (timeslots: any[]) => {
        if (!timeslots.length) {
            return [{ start: "07:00", end: "19:00" }] // whole day free
        }

        const sorted = [...timeslots].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
        )

        const available: any[] = []
        let lastEnd = "07:00:00"

        sorted.forEach(slot => {
            if (slot.start_time > lastEnd) {
                available.push({
                    start: lastEnd,
                    end: slot.start_time
                })
            }
            lastEnd = slot.end_time
        })

        if (lastEnd < "19:00:00") {
            available.push({
                start: lastEnd,
                end: "19:00:00"
            })
        }

        return available
    }

    const formatTime = (time: string | null | undefined) => {
        if (!time) return '—'

        try {
            let date: Date

            // ✅ Case 1: HH:mm or HH:mm:ss (ISO safe)
            if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
                const safeTime = time.length === 5 ? `${time}:00` : time
                date = new Date(`1970-01-01T${safeTime}`)
            }

            // ✅ Case 2: 12-hour format (e.g., 2:30 PM)
            else if (/AM|PM/i.test(time)) {
                date = new Date(`1970-01-01 ${time}`)
            }

            // ❌ Unknown format
            else {
                return '—'
            }

            if (isNaN(date.getTime())) return '—'

            return date.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit'
            })

        } catch {
            return '—'
        }
    }
    const handleTypeFilter = (value: string) => {
        setTypeFilter(value)

        router.get('/rooms', {
            status: statusFilter,
            type: value
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }

    /* SUBMIT */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...form,
            equipment: form.equipment_text
                ? form.equipment_text.split(',').map((e: string) => e.trim())
                : []
        }

        if (isEdit && editId) {
            router.put(`/rooms/${editId}`, payload, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/rooms', payload, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        }
    }

    /* DELETE */
    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this room?')) return
        router.delete(`/rooms/${id}`)
    }
    const idleResources = rooms.data.filter((r: any) => {
        return !isRoomOccupiedNow(r)
    })

    return (
        <AppLayout breadcrumbs={[{ title: 'Rooms', href: '/rooms' }]}>
            <Head title="Rooms Management" />

            <div className="p-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                    {/* LEFT SIDE */}
                    <div>
                        <div className="flex items-center gap-2">
                            <Building className="text-blue-500" size={28} />
                            <h1 className="text-2xl font-bold">Resource Management</h1>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                            Manage classrooms, laboratories, and facilities
                        </p>
                    </div>

                    {/* RIGHT SIDE */}
                    <Button onClick={handleOpen} className="gap-2 w-full md:w-auto">
                        <Plus size={18} />
                        Add Resource
                    </Button>

                </div>


                {/* SUMMARY CARDS */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">

                    {/* TOTAL RESOURCES */}
                    <div className="rounded-xl border p-4 bg-white shadow-sm">
                        <p className="text-sm text-muted-foreground">Total Resources</p>
                        <h2 className="text-2xl font-bold">
                            {stats?.total ?? 0}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            All classrooms & facilities
                        </p>
                    </div>

                    {/* AVAILABLE */}
                    <div className="rounded-xl border p-4 bg-white shadow-sm">
                        <p className="text-sm text-muted-foreground">Available</p>
                        <h2 className="text-2xl font-bold text-green-600">
                            {stats?.available ?? 0}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Ready for scheduling
                        </p>
                    </div>

                    {/* OCCUPIED */}
                    <div className="rounded-xl border p-4 bg-white shadow-sm">
                        <p className="text-sm text-muted-foreground">Occupied</p>
                        <h2 className="text-2xl font-bold text-yellow-500">
                            {stats?.occupied ?? 0}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Currently in use
                        </p>
                    </div>

                    {/* MAINTENANCE */}
                    <div className="rounded-xl border p-4 bg-white shadow-sm">
                        <p className="text-sm text-muted-foreground">Maintenance</p>
                        <h2 className="text-2xl font-bold text-red-600">
                            {stats?.maintenance ?? 0}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Under repair / unavailable
                        </p>
                    </div>

                </div>

                {/* TABLE */}
                <div className="rounded-xl border bg-white shadow-sm">

                    {/* HEADER */}
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-lg">Resource Overview</h2>
                        <p className="text-sm text-muted-foreground">
                            List of all facilities and their current status
                        </p>
                    </div>
                    {/* SEGMENTED FILTER */}
                    <div className="w-full mb-4">
                        <div className="flex w-full bg-gray-100 rounded-full p-1">

                            {[
                                { label: 'All Resources', value: 'all' },
                                { label: 'Idle', value: 'idle' },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value as any)}
                                    className={`flex-1 text-sm py-2 rounded-full transition
                    ${activeTab === tab.value
                                            ? 'bg-white shadow font-medium text-black'
                                            : 'text-gray-500 hover:text-black'}
                `}
                                >
                                    {tab.label}
                                </button>
                            ))}

                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">

                        {/* ALL */}
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="classroom">Classroom</option>
                            <option value="laboratory">Laboratory</option>
                            <option value="auditorium">Auditorium</option>
                        </select>

                    </div>
                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        {activeTab === 'all' && (

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-left text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="p-3">Resource</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3">Capacity</th>
                                            <th className="p-3">Location</th>
                                            <th className="p-3">Equipment</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rooms.data.map((r: any) => {
                                            // console.log("ROOM IDS:", rooms.data.map(r => r.id))
                                            //console.log("Idle Rooms:", idleResources)
                                            const status = r.resource_status || r.status

                                            return (
                                                <tr
                                                    key={r.id}
                                                    onClick={() => {
                                                        setSelectedRoom(r)
                                                        setViewOpen(true)
                                                    }}
                                                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                                                >
                                                    <td className="p-3 font-medium">{r.room_name}</td>

                                                    <td className="p-3">
                                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-xs capitalize">
                                                            {r.resource_type || r.room_type}
                                                        </span>
                                                    </td>

                                                    <td className="p-3">{r.capacity}</td>

                                                    <td className="p-3">
                                                        {r.building
                                                            ? `Building ${r.building}, Floor ${r.floor}`
                                                            : '—'}
                                                    </td>

                                                    <td className="p-3">
                                                        {(r.equipment || []).slice(0, 2).map((eq: string, i: number) => (
                                                            <span key={i} className="px-2 py-1 text-xs bg-gray-100 rounded-md mr-1">
                                                                {eq}
                                                            </span>
                                                        ))}
                                                    </td>

                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-md text-xs capitalize
                                                     ${status === 'occupied'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : status === 'maintenance'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-green-100 text-green-700'}
                                                                                         `}>
                                                            {status}
                                                        </span>
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleOpenEdit(r)
                                                            }}
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDelete(r.id)
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                        )}
                        {activeTab === 'idle' && (
                            <div className="grid md:grid-cols-3 gap-4">
                                {rooms.data
                                    .filter(r => r.resource_status === 'available') // ✅ use DB status
                                    .map((r: any) => {

                                        const days = groupSchedulesByDay(r)
                                        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

                                        return (
                                            <div key={r.id} className="border rounded-xl p-4 bg-white shadow-sm">

                                                <h3 className="font-semibold text-lg">{r.room_name}</h3>

                                                <p className="text-sm text-gray-500">
                                                    {r.building
                                                        ? `Building ${r.building}, Floor ${r.floor}`
                                                        : 'No location'}
                                                </p>

                                                <p className="text-sm mt-2">
                                                    Capacity: <span className="font-medium">{r.capacity}</span>
                                                </p>

                                                {/* 🔥 WEEKLY AVAILABILITY */}
                                                <div className="mt-3 space-y-1">
                                                    Available Time:
                                                    {weekDays.map(day => {

                                                        const slots = days[day] || []
                                                        const available = getAvailableRanges(slots)

                                                        return (
                                                            <p key={day} className="text-xs text-gray-600">
                                                                <span className="font-medium w-16 inline-block">
                                                                    {day.slice(0, 3)}:
                                                                </span>

                                                                {available.length
                                                                    ? `${formatTime(available[0].start)} - ${formatTime(available[0].end)}`
                                                                    : 'Fully occupied'}
                                                            </p>
                                                        )
                                                    })}
                                                </div>

                                                <p className="text-xs text-green-600 mt-2">
                                                    Available now
                                                </p>

                                            </div>
                                        )
                                    })}
                            </div>
                        )}
                    </div>
                </div>

                <Pagination links={rooms.links} />

                {/* MODAL */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-xl p-6">

                        {/* HEADER */}
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">
                                {isEdit ? "Edit Resource" : "Add New Resource"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Add a new classroom, laboratory or facility
                            </p>
                        </div>

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

                            {/* NAME */}
                            <div>
                                <Label>Name</Label>
                                <Input
                                    name="room_name"
                                    placeholder="e.g., 01, 02, 03"
                                    value={form.room_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* TYPE */}
                            <div>
                                <Label>Type</Label>
                                <select
                                    name="resource_type"
                                    value={form.resource_type || ''}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="classroom">Classroom</option>
                                    <option value="laboratory">Laboratory</option>
                                    <option value="auditorium">Auditorium</option>
                                </select>
                            </div>
                            <div>
                                <Label>Department</Label>
                                <select
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select department</option>
                                    {departments.map((d: any) => (
                                        <option key={d.id} value={d.id}>
                                            {d.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* CAPACITY */}
                            <div>
                                <Label>Capacity</Label>
                                <Input
                                    type="number"
                                    name="capacity"
                                    placeholder="30"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* LOCATION (SPLIT) */}
                            <div>
                                <Label>Location</Label>
                                <div className="grid grid-cols-2 gap-2">

                                    {/* BUILDING */}
                                    <select
                                        name="building"
                                        value={form.building || ''}
                                        onChange={handleChange}
                                        className="border rounded px-3 py-2"
                                    >
                                        <option value="">Building</option>
                                        <option value="A">Building A</option>
                                        <option value="B">Building B</option>
                                        <option value="C">Building C</option>
                                    </select>

                                    {/* FLOOR */}
                                    <select
                                        name="floor"
                                        value={form.floor || ''}
                                        onChange={handleChange}
                                        className="border rounded px-3 py-2"
                                    >
                                        <option value="">Floor</option>
                                        <option value="1">Floor 1</option>
                                        <option value="2">Floor 2</option>
                                        <option value="3">Floor 3</option>
                                    </select>

                                </div>
                            </div>

                            {/* EQUIPMENT */}
                            <div>
                                <Label>Equipment</Label>
                                <textarea
                                    placeholder="Projector, Whiteboard, Audio System..."
                                    className="w-full border rounded px-3 py-2"
                                    value={form.equipment_text || ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            equipment_text: e.target.value
                                        })
                                    }
                                />
                            </div>

                            {/* STATUS */}
                            <div>
                                <Label>Status</Label>
                                <select
                                    name="resource_status"
                                    value={form.resource_status || 'available'}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            {/* BUTTON */}
                            <Button className="w-full mt-4">
                                {loading
                                    ? (isEdit ? "Saving..." : "Adding...")
                                    : (isEdit ? "Update Resource" : "Add Resource")}
                            </Button>

                        </form>
                    </DialogContent>
                </Dialog>

                {/* modal for slideview detail */}
                <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                    <DialogContent className="max-w-md p-6 rounded-2xl">

                        {selectedRoom && (
                            <div className="space-y-4">

                                {/* HEADER */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {selectedRoom.room_name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {selectedRoom.building
                                                ? `Building ${selectedRoom.building}, Floor ${selectedRoom.floor}`
                                                : 'No location'}
                                        </p>
                                    </div>

                                    {(() => {
                                        const status = selectedRoom.resource_status || selectedRoom.status

                                        return (
                                            <span
                                                className={`px-2 py-1 rounded-md text-xs capitalize
        ${status === 'occupied'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : status === 'maintenance'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        )
                                    })()}
                                </div>

                                {/* DETAILS */}
                                <div className="space-y-2 text-sm">

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Capacity:</span>
                                        <span className="font-medium">
                                            {selectedRoom.capacity} students
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Type:</span>
                                        <span className="capitalize">
                                            {selectedRoom.resource_type}
                                        </span>
                                    </div>

                                </div>

                                {/* EQUIPMENT */}
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Equipment:</p>

                                    <div className="flex flex-wrap gap-2">
                                        {(selectedRoom.equipment || []).map((eq: string, i: number) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                                            >
                                                {eq}
                                            </span>
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