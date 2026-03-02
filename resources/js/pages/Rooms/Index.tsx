import { Head, router, usePage } from '@inertiajs/react'

import { Plus, Pencil, Trash2, Building } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
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
    room_type: '',
    capacity: '',
    department_id: '',
    status: 'active'
}

export default function Index() {
    const { rooms, departments } = usePage().props as unknown as {
        rooms: Room[],
        departments: Department[]
    }

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(emptyForm)
    const [loading, setLoading] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

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

    /* SUBMIT */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (isEdit && editId) {
            router.put(`/rooms/${editId}`, form, {
                onSuccess: () => {
                    setLoading(false)
                    handleClose()
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/rooms', form, {
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
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Building className="mr-2 text-blue-500" size={28} />
                        <h1 className="text-2xl font-bold">Manage Rooms</h1>
                    </div>

                    <Button onClick={handleOpen} className="gap-2">
                        <Plus size={18} />
                        Add Room
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto rounded-lg shadow border">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Room</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-left">Capacity</th>
                                <th className="px-4 py-2 text-left">Department</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rooms.length > 0 ? rooms.map(r => (
                                <tr key={r.id} className="border-t">
                                    <td className="px-4 py-2">{r.room_name}</td>
                                    <td className="px-4 py-2 capitalize">{r.room_type}</td>
                                    <td className="px-4 py-2">{r.capacity}</td>
                                    <td className="px-4 py-2">{r.department?.department_name}</td>
                                    <td className="px-4 py-2">
                                        <span className={
                                            r.status === 'active'
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }>
                                            {r.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mr-2"
                                            onClick={() => handleOpenEdit(r)}
                                        >
                                            <Pencil size={16} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                                        No Rooms Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? 'Edit Room' : 'Add Room'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <Input
                                name="room_name"
                                placeholder="Room Name"
                                value={form.room_name}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <Label>Room Type</Label>
                                <select
                                    name="room_type"
                                    value={form.room_type}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="lecture">Lecture</option>
                                    <option value="laboratory">Laboratory</option>
                                </select>
                            </div>

                            <Input
                                type="number"
                                name="capacity"
                                placeholder="Capacity"
                                value={form.capacity}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <Label>Department</Label>
                                <select
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full border rounded px-2 py-2"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit">
                                    {loading
                                        ? (isEdit ? 'Saving...' : 'Adding...')
                                        : (isEdit ? 'Save Changes' : 'Add Room')}
                                </Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}