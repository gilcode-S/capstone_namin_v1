import { Head, router, usePage } from '@inertiajs/react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
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



interface Department {
  id: number
  department_name: string
}

interface Availability {
  day_of_week: string
  start_time: string
  end_time: string
}

interface Shift {
  id: number
  shift_name: string
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
  employment_type: string
  max_load_units: number
  qualification_level: string
  years_experience: number
  status: string
  availabilities: Availability[]
  shifts: Shift[]
}

const emptyForm = {
  department_id: '',
  faculty_code: '',
  first_name: '',
  last_name: '',
  email: '',
  employment_type: '',
  max_load_units: 21,
  status: 'active',
  availabilities: [] as string[],
  shifts: [] as number[],
  qualificataion_level: '',
  years_experience: ''
}

export default function Index() {
  const { faculties, departments, stats, filters, shifts } = usePage().props as unknown as {
    faculties: {
      data: Faculty[],
      links: any[]
    },
    departments: Department[]
  }

  const [open, setOpen] = useState(false)
  const [availabilityOpen, setAvailabilityOpen] = useState(false)
  const [form, setForm] = useState<any>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [search, setSearch] = useState(filters.search || '')
  const [departmentFilter, setDepartmentFilter] = useState(filters.department || '')

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
      employment_type: faculty.employment_type,
      qualification_level: faculty.qualification_level,
      years_experience: faculty.years_experience,
      max_load_units: faculty.max_load_units,
      status: faculty.status,
      // ✅ FIX THIS
      availability: faculty.availabilities?.map(a => a.day_of_week) || [],

      // ✅ if you load shifts later
      shifts: faculty.shifts?.map(s => s.id) || []
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
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setForm(prev => ({
      ...prev,
      availability: checked
        ? [...(prev.availability || []), value]
        : (prev.availability || []).filter(d => d !== value)
    }));
  };
  const handleShiftChange = (e) => {
    const value = Number(e.target.value); // ✅ convert to number
    const checked = e.target.checked;

    setForm(prev => {
      let updated = checked
        ? [...(prev.shifts || []), value]
        : prev.shifts.filter(s => s !== value);

      if (updated.length > 2) return prev;

      return { ...prev, shifts: updated };
    });
  }

  /* ---------------------------
     SUBMIT
  ----------------------------*/
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // ✅ TRANSFORM HERE
    const payload = {
      ...form,

      // convert checkbox days → backend format
      availabilities: (form.availability || []).map(day => ({
        day_of_week: day,
        start_time: "08:00",
        end_time: "17:00"
      }))
    }

    console.log("PAYLOAD:", payload) // ✅ debug

    if (isEdit && editId) {
      router.put(`/faculty/${editId}`, payload, {
        onSuccess: () => {
          setLoading(false)
          handleClose()
        },
        onError: (errors) => {
          console.log("ERRORS:", errors)
          setLoading(false)
        }
      })
    } else {
      router.post('/faculty', payload, {
        onSuccess: () => {
          setLoading(false)
          handleClose()
        },
        onError: (errors) => {
          console.log("ERRORS:", errors)
          setLoading(false)
        }
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



  // SEARCH
  const handleSearch = (value: string) => {
    setSearch(value)

    router.get('/faculty', {
      search: value,
      department: departmentFilter,
      page: 1
    }, { preserveState: true, replace: true })
  }

  // DEPARTMENT
  const handleDepartment = (value: string) => {
    setDepartmentFilter(value)

    router.get('/faculty', {
      search,
      department: value,
      page: 1
    }, { preserveState: true, replace: true })
  }

  return (
    <AppLayout breadcrumbs={[{ title: "Faculty", href: "/faculty" }]}>
      <Head title="Faculty Management" />

      <div className="p-6">


        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="mr-2 text-blue-500" size={28} />
            <h1 className="text-2xl font-bold">Faculty Management</h1>
          </div>

          <Button onClick={handleOpen} className="gap-2">
            <Plus size={18} />
            Add Teacher
          </Button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">

          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-sm text-muted-foreground">Total Teachers</p>
            <h2 className="text-2xl font-bold">{stats?.total ?? 0}</h2>
            <p className="text-xs text-muted-foreground">Active faculty members</p>
          </div>

          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-sm text-muted-foreground">Average Workloads</p>
            <h2 className="text-2xl font-bold">{stats?.avg_load ?? 0}%</h2>
            <p className="text-xs text-muted-foreground">Overall Utilization</p>
          </div>

          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-sm text-muted-foreground">Subjects Covered</p>
            <h2 className="text-2xl font-bold">{stats?.subjects ?? 0}</h2>
            <p className="text-xs text-muted-foreground">Unique subjects</p>
          </div>

        </div>

        {/* FILTERS */}
        <div className="rounded-xl border p-4 mb-6 bg-white shadow-sm">

          <div className="flex flex-col md:flex-row gap-4">

            {/* SEARCH */}
            <Input
              placeholder="Search Teachers or Subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* DEPARTMENT FILTER */}
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value)
                router.get('/faculty', {
                  search,
                  department: e.target.value
                }, {
                  preserveState: true,
                  replace: true
                })
              }}
              className="border rounded px-3 py-2 w-full md:w-64"
            >
              <option value="">All Departments</option>
              {departments.map((d: Department) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>

          </div>

        </div>

        <div className="rounded-xl border bg-white shadow-sm">

          {/* HEADER */}
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Faculty Members</h2>
            <p className="text-sm text-muted-foreground">
              Overview of all teachers, their workloads, and scheduling constraints
            </p>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Subjects</th>
                  <th className="p-3">Hours</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Workload</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {faculties.data.map((f: any) => (
                  <tr key={f.id} className="border-b hover:bg-gray-50 transition">

                    {/* TEACHER */}
                    <td className="p-3 font-medium">
                      {f.first_name} {f.last_name}
                    </td>

                    {/* DEPARTMENT */}
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">
                        {f.department?.department_name}
                      </span>
                    </td>

                    {/* SUBJECTS */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {f.subjects?.slice(0, 2).map((s: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                          >
                            {s}
                          </span>
                        ))}

                        {f.subjects?.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-200 rounded-md">
                            +{f.subjects.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* HOURS + PROGRESS */}
                    <td className="p-3 w-[180px]">
                      <div className="text-xs mb-1">
                        {f.assigned_load}/{f.max_load_units}
                      </div>

                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full ${f.workload_percent >= 90
                            ? 'bg-red-500'
                            : f.workload_percent >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            }`}
                          style={{ width: `${f.workload_percent}%` }}
                        />
                      </div>
                    </td>

                    {/* AVAILABILITY */}
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {f.teaching_days?.slice(0, 3).map((day: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                          >
                            {day}
                          </span>
                        ))}

                        {f.teaching_days?.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-200 rounded-md">
                            +{f.teaching_days.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* WORKLOAD % */}
                    <td className="p-3 font-semibold">
                      <span
                        className={
                          f.workload_percent >= 90
                            ? 'text-red-600'
                            : f.workload_percent >= 70
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }
                      >
                        {f.workload_percent}%
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(f)}
                        >
                          <Pencil size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(f.id)}
                        >
                          <Trash2 size={14} />
                        </Button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination links={faculties.links} />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden">

            {/* HEADER */}
            <div className="p-6 border-b">
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Enter teacher information and preferences
              </p>
            </div>

            {/* BODY (SCROLLABLE) */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[70vh] overflow-y-auto p-6 space-y-4 bg-gray-50"
            >

              {/* NAME */}
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              {/* FACULTY CODE */}
              <Input
                name="faculty_code"
                placeholder="Faculty Code (e.g. FAC-001)"
                value={form.faculty_code}
                onChange={handleChange}
                required
              />

              {/* EMAIL */}
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              {/* EMPLOYMENT */}
              <select
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Employment Type</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
              </select>

              {/* DEPARTMENT */}
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>

              {/* QUALIFICATION */}
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="qualification_level"
                  value={form.qualification_level}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="">Qualification</option>
                  <option>Bachelor</option>
                  <option>Master</option>
                  <option>PhD</option>
                </select>

                <Input
                  type="number"
                  name="years_experience"
                  placeholder="Years Experience"
                  value={form.years_experience}
                  onChange={handleChange}
                />
              </div>

              {/* AVAILABILITY */}
              <div>
                <Label>Availability</Label>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <label key={day} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={day}
                        onChange={handleCheckboxChange}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              {/* SHIFT */}
              <div>
                <Label>Shift (Select 2)</Label>
                <div className="flex gap-4 mt-2 text-sm">
                  {shifts.map((shift) => (
                    <label key={shift.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={shift.id} // ✅ IMPORTANT (ID, not name)
                        onChange={handleShiftChange}
                      />
                      {shift.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>

                <Button type="submit">
                  {isEdit ? "Save Changes" : "Add Teacher"}
                </Button>
              </div>

            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}