import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Pencil, Trash2, Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
import Pagination from '@/components/Pagination'
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

interface TimeSlot {
  id: number
  start_time: string
  end_time: string
  shift: string
  status: string
}

const emptyForm = {
  start_time: '',
  end_time: '',
  shift: '',
  status: 'active'
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Index() {
  const { timeSlots } = usePage().props as any

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'table' | 'preview'>('table')
  const [form, setForm] = useState<any>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const getShift = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  const formatTime = (time: string) => {
    if (!time) return ""

    // 🔥 If already formatted, just return it
    if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
      return time
    }

    const [hour, minute] = time.split(":")
    let h = parseInt(hour)
    const ampm = h >= 12 ? "PM" : "AM"

    h = h % 12 || 12

    return `${h}:${minute} ${ampm}`
  }

  const groupedSlots = useMemo(() => {
    return {
      morning: timeSlots.data.filter((s: TimeSlot) => s.shift === 'morning'),
      afternoon: timeSlots.data.filter((s: TimeSlot) => s.shift === 'afternoon'),
      evening: timeSlots.data.filter((s: TimeSlot) => s.shift === 'evening'),
    }
  }, [timeSlots.data])

  const handleOpen = () => {
    setForm(emptyForm)
    setIsEdit(false)
    setEditId(null)
    setOpen(true)
  }

  const handleOpenEdit = (slot: TimeSlot) => {
    setForm({
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      shift: slot.shift,
      status: slot.status
    })
    setIsEdit(true)
    setEditId(slot.id)
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...form,
      shift: getShift(form.start_time)
    }

    if (isEdit && editId) {
      router.put(`/time-slots/${editId}`, payload, {
        onSuccess: () => setOpen(false)
      })
    } else {
      router.post('/time-slots', payload, {
        onSuccess: () => setOpen(false)
      })
    }
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this timeslot?')) return
    router.delete(`/time-slots/${id}`)
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Time Slots', href: '/time-slots' }]}>
      <Head title="Time Slot Management" />

      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Timeslot</h1>
            <p className="text-sm text-gray-500">
              View and manage class time slots for scheduling.
            </p>
          </div>

          <Button onClick={handleOpen} className="rounded-xl">
            <Plus size={16} className="mr-2" />
            Add time
          </Button>
        </div>

        {/* TABS */}
        <div className="bg-gray-200 rounded-full p-1 flex">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-2 rounded-full text-sm font-medium ${activeTab === 'table' ? 'bg-white shadow' : ''
              }`}
          >
            Timeslot
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 rounded-full text-sm font-medium ${activeTab === 'preview' ? 'bg-white shadow' : ''
              }`}
          >
            Schedule Preview
          </button>
        </div>

        {/* TABLE TAB */}
        {activeTab === 'table' && (
          <div className="border rounded-2xl bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Shift</th>
                  <th className="p-4 text-left">Time Start</th>
                  <th className="p-4 text-left">Time End</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {timeSlots.data.map((slot: TimeSlot) => (
                  <tr key={slot.id} className="border-b">
                    <td className="p-4 capitalize">{slot.shift}</td>
                    <td className="p-4">{formatTime(slot.start_time)}</td>
                    <td className="p-4">{formatTime(slot.end_time)}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(slot)}>
                          <Pencil size={14} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(slot.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* <Pagination links={timeSlots.links} /> */}
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([shift, slots]: any) => (
              <div key={shift} className="bg-white rounded-2xl border overflow-hidden">

                {/* SHIFT HEADER */}
                <div className="px-4 py-3 border-b font-semibold capitalize bg-gray-50">
                  {shift}
                </div>

                <table className="w-full text-sm border-collapse">

                  {/* HEADER */}
                  <thead>
                    <tr>
                      <th className="border p-3 text-left w-[140px]">Time</th>
                      {days.map(day => (
                        <th key={day} className="border p-3 text-center">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {slots.map((slot: TimeSlot) => (
                      <tr key={slot.id}>

                        {/* TIME */}
                        <td className="border p-3 whitespace-nowrap font-medium">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </td>

                        {/* DAYS */}
                        {days.map(day => (
                          <td key={day} className="border p-3 text-center text-gray-300">
                            —
                          </td>
                        ))}

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Timeslot' : 'Add Timeslot'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />

              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
              />

              <DialogFooter>
                <Button type="submit">
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}