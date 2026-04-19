import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Pencil, Trash2, Clock } from 'lucide-react'
import { useState } from 'react'
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
  day_of_week: string
  start_time: string
  end_time: string
  shift: string
  status: string
}

const emptyForm = {
  day_of_week: '',
  start_time: '',
  end_time: '',
  shift: '',
  status: 'active'
}

export default function Index() {
  const { timeSlots } = usePage().props as unknown as {
    timeSlots: {
      data: TimeSlot[],
      links: any[]
    }
  }

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  /* 🔥 SHIFT AUTO-DETECT */
  const getShift = (time: string) => {
    if (!time) return ''
    if (time < '12:00') return 'morning'
    if (time < '18:00') return 'afternoon'
    return 'evening'
  }

  /* 🔥 VALIDATION */
  const isValidSchoolTime = (time: string) => {
    return time >= '07:00' && time <= '22:00'
  }

  /* 🔥 AUTO FIX */
  const clampTime = (time: string) => {
    if (time < '07:00') return '07:00'
    if (time > '22:00') return '22:00'
    return time
  }

  /* OPEN CREATE */
  const handleOpen = () => {
    setForm(emptyForm)
    setIsEdit(false)
    setEditId(null)
    setOpen(true)
  }

  /* OPEN EDIT */
  const handleOpenEdit = (slot: TimeSlot) => {
    setForm({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      shift: slot.shift,
      status: slot.status
    })

    setIsEdit(true)
    setEditId(slot.id)
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
    let updatedForm = {
      ...form,
      [e.target.name]: e.target.value
    }

    if (e.target.name === 'start_time') {
      const clamped = clampTime(e.target.value)
      updatedForm.start_time = clamped
      updatedForm.shift = getShift(clamped)
    }

    if (e.target.name === 'end_time') {
      updatedForm.end_time = clampTime(e.target.value)
    }

    setForm(updatedForm)
  }

  /* SUBMIT */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidSchoolTime(form.start_time) || !isValidSchoolTime(form.end_time)) {
      alert('Time must be between 7:00 AM and 10:00 PM.')
      return
    }

    if (form.start_time >= form.end_time) {
      alert('End time must be after start time.')
      return
    }

    form.shift = getShift(form.start_time)

    setLoading(true)

    if (isEdit && editId !== null) {
      router.put(`/time-slots/${editId}`, form, {
        onSuccess: () => {
          setLoading(false)
          handleClose()
        },
        onError: () => setLoading(false)
      })
    } else {
      router.post('/time-slots', form, {
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
    if (!confirm('Are you sure you want to delete this time slot?')) return
    router.delete(`/time-slots/${id}`)
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Time Slots', href: '/time-slots' }]}>
      <Head title="Time Slots Management" />

      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Clock className="mr-2 text-blue-500" size={28} />
            <h1 className="text-2xl font-bold">Manage Time Slots</h1>
          </div>

          <Button onClick={handleOpen} className="gap-2">
            <Plus size={18} />
            Add Time Slot
          </Button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Shift</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {timeSlots.data.length > 0 ? timeSlots.data.map(slot => (
                <tr key={slot.id} className="border-t">
                  <td className="px-4 py-2">{slot.day_of_week}</td>
                  <td className="px-4 py-2">{slot.start_time}</td>
                  <td className="px-4 py-2">{slot.end_time}</td>

                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-white text-xs
                      ${slot.shift === 'morning' && 'bg-yellow-500'}
                      ${slot.shift === 'afternoon' && 'bg-orange-500'}
                      ${slot.shift === 'evening' && 'bg-indigo-600'}
                    `}>
                      {slot.shift}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <span className={
                      slot.status === 'active'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }>
                      {slot.status}
                    </span>
                  </td>

                  <td className="px-4 py-2 text-center">
                    <Button size="sm" variant="outline" className="mr-2"
                      onClick={() => handleOpenEdit(slot)}>
                      <Pencil size={16} />
                    </Button>

                    <Button size="sm" variant="destructive"
                      onClick={() => handleDelete(slot.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    No Time Slots Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination links={timeSlots.links} />

        {/* MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isEdit ? 'Edit Time Slot' : 'Add Time Slot'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <Label>Day</Label>
                <select
                  name="day_of_week"
                  value={form.day_of_week}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-2"
                  required
                >
                  <option value="">Select Day</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                </select>
              </div>

              <Input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                min="07:00"
                max="22:00"
                required
              />

              <Input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                min="07:00"
                max="22:00"
                required
              />

              <p className="text-xs text-gray-400">
                Allowed time: 7:00 AM – 10:00 PM
              </p>

              {form.start_time && (
                <div className="text-sm text-gray-500">
                  Auto Shift: <strong>{getShift(form.start_time)}</strong>
                </div>
              )}

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
                <Button type="button" variant="outline"
                  onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>

                <Button type="submit">
                  {loading
                    ? (isEdit ? 'Saving...' : 'Adding...')
                    : (isEdit ? 'Save Changes' : 'Add Time Slot')}
                </Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}