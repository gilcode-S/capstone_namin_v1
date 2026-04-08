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

interface Room {
    id: number
    room_name: string
    room_type: string
    capacity: number
    status: string
    department: Department
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
            room_type: room.room_type,
            capacity: room.capacity,
            department_id: room.department?.id,
            status: room.status
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
            replace: true,
        })
    }

    const handleTypeFilter = (value: string) => {
        setTypeFilter(value)

        router.get('/rooms', {
            status: statusFilter,
            type: value
        }, {
            preserveState: true,
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

                                    const status = r.resource_status || r.status

                                    return (
                                        <tr key={r.id} className="border-b hover:bg-gray-50 transition">

                                            {/* RESOURCE NAME */}
                                            <td className="p-3 font-medium">
                                                {r.room_name}
                                            </td>

                                            {/* TYPE BADGE */}
                                            <td className="p-3">
                                                <span className="px-2 py-1 rounded-md bg-gray-100 text-xs capitalize">
                                                    {r.resource_type || r.room_type}
                                                </span>
                                            </td>

                                            {/* CAPACITY */}
                                            <td className="p-3">
                                                {r.capacity}
                                            </td>

                                            {/* LOCATION */}
                                            <td className="p-3">
                                                <span className="text-sm text-gray-600">
                                                    {r.building
                                                        ? `Building ${r.building}, Floor ${r.floor}`
                                                        : '—'}
                                                </span>
                                            </td>

                                            {/* EQUIPMENT */}
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {(r.equipment || []).slice(0, 2).map((eq: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                                                        >
                                                            {eq}
                                                        </span>
                                                    ))}

                                                    {(r.equipment || []).length > 2 && (
                                                        <span className="px-2 py-1 text-xs bg-gray-200 rounded-md">
                                                            +{r.equipment.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-medium
                ${status === 'available' && 'bg-green-100 text-green-700'}
                ${status === 'occupied' && 'bg-yellow-100 text-yellow-700'}
                ${status === 'maintenance' && 'bg-red-100 text-red-700'}
                `}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenEdit(r)}
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(r.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>

                                                </div>
                                            </td>

                                        </tr>
                                    )
                                })}
                            </tbody>

                        </table>
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

            </div>
        </AppLayout>
    )
}