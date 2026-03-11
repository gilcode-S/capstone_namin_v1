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
  mode: string
  status: string
}

const emptyForm = {
  day_of_week: '',
  start_time: '',
  end_time: '',
  mode: '',
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
      start_time: slot.start_time.slice(0, 5), // remove seconds
      end_time: slot.end_time.slice(0, 5),     // remove seconds
      mode: slot.mode,
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
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  /* SUBMIT */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (form.start_time >= form.end_time) {
      alert('End time must be after start time.')
      return
    }

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
                <th className="px-4 py-2 text-left">Mode</th>
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
                  <td className="px-4 py-2 capitalize">{slot.mode}</td>
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleOpenEdit(slot)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(slot.id)}
                    >
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
                required
              />

              <Input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
              />

              <div>
                <Label>Mode</Label>
                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-2"
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="f2f">Face to Face</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid na halimaw</option>
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