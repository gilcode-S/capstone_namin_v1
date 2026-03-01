import { Head, router, usePage } from '@inertiajs/react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
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

interface Availability {
  day_of_week: string
  start_time: string
  end_time: string
}

interface Faculty {
  id: number
  department: Department
  faculty_code: string
  first_name: string
  last_name: string
  email: string
  employement_type: string
  max_load_units: number
  status: string
  availabilities: Availability[]
}

const emptyForm = {
  department_id: '',
  faculty_code: '',
  first_name: '',
  last_name: '',
  email: '',
  employement_type: '',
  max_load_units: 21,
  status: 'active',
  availabilities: [] as Availability[]
}

export default function Index() {
  const { faculties, departments } = usePage().props as unknown as {
    faculties: Faculty[],
    departments: Department[]
  }

  const [open, setOpen] = useState(false)
  const [availabilityOpen, setAvailabilityOpen] = useState(false)
  const [form, setForm] = useState<any>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const [availability, setAvailability] = useState<Availability>({
    day_of_week: '',
    start_time: '',
    end_time: ''
  })
  const [isEditAvailability, setIsEditAvailability] = useState(false)
  const [editAvailabilityIndex, setEditAvailabilityIndex] = useState<number | null>(null)

  /* ---------------------------
     OPEN CREATE
  ----------------------------*/
  const handleOpen = () => {
    setForm(emptyForm)
    setIsEdit(false)
    setEditId(null)
    setOpen(true)
  }

  /* ---------------------------
     OPEN EDIT
  ----------------------------*/
  const handleOpenEdit = (faculty: Faculty) => {
    setForm({
      department_id: faculty.department?.id,
      faculty_code: faculty.faculty_code,
      first_name: faculty.first_name,
      last_name: faculty.last_name,
      email: faculty.email,
      employement_type: faculty.employement_type,
      max_load_units: faculty.max_load_units,
      status: faculty.status,
      availabilities: faculty.availabilities || []
    })

    setIsEdit(true)
    setEditId(faculty.id)
    setOpen(true)
  }

  /* ---------------------------
     CLOSE MODAL
  ----------------------------*/
  const handleClose = () => {
    setForm(emptyForm)
    setIsEdit(false)
    setEditId(null)
    setOpen(false)
  }

  /* ---------------------------
     INPUT CHANGE
  ----------------------------*/
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  /* ---------------------------
     ADD AVAILABILITY
  ----------------------------*/
  const saveAvailability = () => {
    if (!availability.day_of_week || !availability.start_time || !availability.end_time) {
      alert("Please complete availability fields")
      return
    }

    // CHECK FOR DUPLICATE SLOT
    const duplicate = form.availabilities.some(
      (slot: Availability, index: number) => {
        if (isEditAvailability && index === editAvailabilityIndex) return false

        return (
          slot.day_of_week === availability.day_of_week &&
          slot.start_time === availability.start_time &&
          slot.end_time === availability.end_time
        )
      }
    )

    if (duplicate) {
      alert("Duplicate availability slot is not allowed.")
      return
    }

    if (isEditAvailability && editAvailabilityIndex !== null) {
      const updated = [...form.availabilities]
      updated[editAvailabilityIndex] = availability

      setForm({
        ...form,
        availabilities: updated
      })
    } else {
      setForm({
        ...form,
        availabilities: [...form.availabilities, availability]
      })
    }

    // RESET
    setAvailability({
      day_of_week: '',
      start_time: '',
      end_time: ''
    })

    setIsEditAvailability(false)
    setEditAvailabilityIndex(null)
    setAvailabilityOpen(false)
  }

  const editAvailability = (slot: Availability, index: number) => {
    setAvailability(slot)
    setIsEditAvailability(true)
    setEditAvailabilityIndex(index)
    setAvailabilityOpen(true)
  }
  /* ---------------------------
     REMOVE AVAILABILITY
  ----------------------------*/
  const removeAvailability = (index: number) => {
    const updated = [...form.availabilities]
    updated.splice(index, 1)

    setForm({
      ...form,
      availabilities: updated
    })
  }

  /* ---------------------------
     SUBMIT
  ----------------------------*/
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isEdit && editId) {
      router.put(`/faculty/${editId}`, form, {
        onSuccess: () => {
          setLoading(false)
          handleClose()
        },
        onError: () => setLoading(false)
      })
    } else {
      router.post('/faculty', form, {
        onSuccess: () => {
          setLoading(false)
          handleClose()
        },
        onError: () => setLoading(false)
      })
    }
  }

  /* ---------------------------
     DELETE
  ----------------------------*/
  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this faculty?")) return
    router.delete(`/faculty/${id}`)
  }

  return (
    <AppLayout breadcrumbs={[{ title: "Faculty", href: "/faculty" }]}>
      <Head title="Faculty Management" />

      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="mr-2 text-blue-500" size={28} />
            <h1 className="text-2xl font-bold">Manage Faculty</h1>
          </div>

          <Button onClick={handleOpen} className="gap-2">
            <Plus size={18} />
            Add Faculty
          </Button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Max Load</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Availability</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {faculties.length > 0 ? faculties.map(f => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-2">{f.faculty_code}</td>
                  <td className="px-4 py-2">{f.first_name} {f.last_name}</td>
                  <td className="px-4 py-2">{f.department?.department_name}</td>
                  <td className="px-4 py-2">{f.employement_type}</td>
                  <td className="px-4 py-2">{f.max_load_units}</td>
                  <td className="px-4 py-2">
                    <span className={
                      f.status === 'active'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {f.availabilities?.length || 0} slots
                  </td>

                  <td className="px-4 py-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleOpenEdit(f)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(f.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                    No Faculty Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FACULTY MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Edit Faculty" : "Add Faculty"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">

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

              <Input
                name="faculty_code"
                placeholder="Faculty Code"
                value={form.faculty_code}
                onChange={handleChange}
                required
              />

              <Input
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                required
              />

              <Input
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                required
              />

              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <div>
                <Label>Employment Type</Label>
                <select
                  name="employement_type"
                  value={form.employement_type}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-2"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                </select>
              </div>

              <Input
                type="number"
                name="max_load_units"
                placeholder="Max Load Units"
                value={form.max_load_units}
                onChange={handleChange}
                required
              />

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

              {/* AVAILABILITY */}
              <div>
                <div className='flex justify-between items-center'>
                  <Label>Availability</Label>

                  <Button
                    type="button"
                    onClick={() => {
                      setAvailability({
                        day_of_week: '',
                        start_time: '',
                        end_time: ''
                      })
                      setIsEditAvailability(false)
                      setEditAvailabilityIndex(null)
                      setAvailabilityOpen(true)
                    }}
                  >
                    Add Availability Slot
                  </Button>
                </div>

                {form.availabilities.length > 0 ? (
                  form.availabilities.map((a: Availability, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center mt-2 text-sm border p-2 rounded"
                    >
                      <span>
                        {a.day_of_week} | {a.start_time} - {a.end_time}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => editAvailability(a, index)}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAvailability(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    No availability added
                  </p>
                )}
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
                    ? (isEdit ? "Saving..." : "Adding...")
                    : (isEdit ? "Save Changes" : "Add Faculty")}
                </Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

        {/* AVAILABILITY MODAL */}
        <Dialog open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditAvailability ? "Edit Availability" : "Add Availability"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

              <select
                value={availability.day_of_week}
                onChange={e =>
                  setAvailability({ ...availability, day_of_week: e.target.value })
                }
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Select Day</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
              </select>

              <Input
                type="time"
                value={availability.start_time}
                onChange={e =>
                  setAvailability({ ...availability, start_time: e.target.value })
                }
              />

              <Input
                type="time"
                value={availability.end_time}
                onChange={e =>
                  setAvailability({ ...availability, end_time: e.target.value })
                }
              />

              <DialogFooter>
                <Button type="button" onClick={saveAvailability}>
                  {isEditAvailability ? "Update Slot" : "Add Slot"}
                </Button>
              </DialogFooter>

            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}