import { Head, router, usePage } from '@inertiajs/react'
import { Clock, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
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

interface Schedule {
  day: string
  start_time: string
  end_time: string
  subject: string
  room: string
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
  schedule?: Schedule[]
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
  years_experience: '',

  degree: '',
  domains: []
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
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const groupedSchedule = selectedFaculty?.schedule_full?.reduce((acc, s) => {
    if (!acc[s.day]) acc[s.day] = []
    acc[s.day].push(s)
    return acc
  }, {}) || {}

  const [availability, setAvailability] = useState<Availability>({
    day_of_week: '',
    start_time: '',
    end_time: ''
  })
  const [isEditAvailability, setIsEditAvailability] = useState(false)
  const [editAvailabilityIndex, setEditAvailabilityIndex] = useState<number | null>(null)


  useEffect(() => {
    const delay = setTimeout(() => {
      router.get('/faculty', {
        search,
        department: departmentFilter
      }, {
        preserveState: true,
        replace: true
      })
    }, 400)

    return () => clearTimeout(delay)
  }, [search])

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

      availability: faculty.availabilities?.map(a => a.day_of_week) || [],


      shifts: faculty.shifts?.map(s => s.id) || [],

      degree: faculty.degree || '',
      domains: faculty.domains || [],
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
    const value = Number(e.target.value);
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

    const payload = {
      ...form,

      // convert checkbox days → backend format
      // availabilities: (form.availability || []).map(day => ({
      //   day_of_week: day,
      //   start_time: "08:00",
      //   end_time: "17:00"
      // }))
      availability: form.availability || []
    }

    console.log("PAYLOAD:", payload)

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

  const handleFilterChange = (key: string, value: string) => {
    router.get('/faculty', {
      search,
      department: departmentFilter,
      [key]: value
    }, {
      preserveState: true,
      replace: true
    })
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

  // const formatTime = (time: string) => {
  //   if (!time) return ""

  //   const [hour, minute] = time.split(":")
  //   let h = parseInt(hour)
  //   const ampm = h >= 12 ? "PM" : "AM"

  //   h = h % 12 || 12

  //   return `${h}:00 ${ampm}`
  // }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const times = [
    "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
    "8:00 PM", "9:00 PM", "10:00 PM"
  ]

  const formatTime = (time: string) => {
    if (!time) return ""

    const [hour] = time.split(":")
    let h = parseInt(hour)
    const ampm = h >= 12 ? "PM" : "AM"
    h = h % 12 || 12

    return `${h}:00 ${ampm}`
  }

  return (
    <AppLayout breadcrumbs={[{ title: "Faculty", href: "/faculty" }]}>
      <Head title="Faculty Management" />

      <div className="p-6">


        {/* HEADER */}
        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Faculty Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage faculty members, their subjects, and availability for options scheduling
            </p>
          </div>

          <Button onClick={handleOpen} className="gap-2" className="bg-black text-white rounded-xl px-4 py-2 shadow-sm hover:bg-gray-900">
            + Add Faculty
          </Button>

        </div>

        {/* SUMMARY CARDS */}

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* TOTAL TEACHERS */}
          <div className="bg-white border rounded-2xl p-5 flex justify-between items-start shadow-sm">

            <div>
              <p className="text-sm text-gray-500">Total Teachers</p>
              <h2 className="text-2xl font-semibold mt-2">
                {stats?.total ?? 0}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Active faculty members
              </p>
            </div>

            {/* ICON */}
            <div className="text-gray-400">
              <Users size={20} />
            </div>

          </div>

          {/* AVERAGE WORKLOAD */}
          <div className="bg-white border rounded-2xl p-5 flex justify-between items-start shadow-sm">

            <div>
              <p className="text-sm text-gray-500">Average Workloads</p>
              <h2 className="text-2xl font-semibold mt-2">
                {stats?.avg_load ?? 0}%
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Overall Utilization
              </p>
            </div>

            {/* ICON */}
            <div className="text-gray-400">
              <Clock size={20} />
            </div>

          </div>

        </div>



        {/* FILTERS */}
        <div className="rounded-xl border p-4 mb-6 bg-white shadow-sm">

          <div className="flex flex-col md:flex-row gap-4">

            {/* SEARCH */}
            <Input
              placeholder="Search Teachers or Subjects..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
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
                  <tr
                    key={f.id}
                    onClick={() => {
                      setSelectedFaculty(f)
                      setViewOpen(true)
                    }}
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                  >

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

                    {/* AVAILABILITY ✅ FIXED */}
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {f.availability_full?.slice(0, 3).map((a: any, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                          >
                            {a.day_of_week}
                          </span>
                        ))}

                        {f.availability_full?.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-200 rounded-md">
                            +{f.availability_full.length - 3}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(f)
                          }}
                        >
                          <Pencil size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(f.id)
                          }}
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
          <DialogContent className="max-w-3xl rounded-2xl p-0">

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

              {/* DEGREE */}
              <select
                name="degree"
                value={form.degree}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Degree</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>


              {/* DOMAINS CAN TEACH */}
              <div>
                <Label>Domains Can Teach</Label>

                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">

                  {[
                    "Computer Science / IT",
                    "Business / Management",
                    "Tourism / Hospitality",
                    "Criminology / Law",
                    "General Education"
                  ].map(domain => (
                    <label key={domain} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={domain}
                        checked={form.domains?.includes(domain)}
                        onChange={(e) => {
                          const checked = e.target.checked

                          setForm(prev => ({
                            ...prev,
                            domains: checked
                              ? [...(prev.domains || []), domain]
                              : prev.domains.filter((d: string) => d !== domain)
                          }))
                        }}
                      />
                      {domain}
                    </label>
                  ))}

                </div>
              </div>

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
                        checked={form.availability?.includes(day)}
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
                        value={shift.id}
                        checked={form.shifts?.includes(shift.id)}
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


        {/* pop up modal */}
        {/* FACULTY VIEW MODAL */}
        <Dialog
          open={viewOpen}
          onOpenChange={(open) => {
            setViewOpen(open)
            if (!open) setSelectedFaculty(null)
          }}
        >
          <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 rounded-2xl">

            {selectedFaculty && (
              <div className="flex flex-col h-full bg-white">

                {/* HEADER (FIXED) */}
                <div className="p-6 border-b shrink-0 bg-white">
                  <h2 className="text-2xl font-bold">
                    {selectedFaculty.first_name} {selectedFaculty.last_name}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Department: {selectedFaculty.department?.department_name || "N/A"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Subjects: {selectedFaculty.subjects?.join(", ") || "None"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Availability: {
                      selectedFaculty.availability_full?.map(a => a.day_of_week).join(", ")
                      || "None"
                    }
                  </p>

                  <p className="text-sm text-gray-500">
                    Workload: {selectedFaculty.workload_percent ?? 0}%
                  </p>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">

                  {/* WEEKLY SCHEDULE */}
                  <div className="bg-white rounded-xl border overflow-hidden">

                    {/* SCHEDULE HEADER (STICKY) */}
                    <div className="p-4 border-b sticky top-0 bg-white z-10">
                      <h3 className="font-semibold text-lg">Weekly Schedule</h3>
                      <p className="text-sm text-gray-500">
                        Showing assigned teaching schedule
                      </p>
                    </div>

                    {/* EMPTY STATE */}
                    {Object.keys(groupedSchedule).length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        No schedule assigned
                      </div>
                    )}

                    {/* SCHEDULE LIST */}
                    <div className="divide-y">

                      {Object.entries(groupedSchedule).map(([day, schedules]) => (
                        <div key={day}>

                          {/* DAY HEADER (OPTIONAL STICKY 🔥) */}
                          <div className="bg-gray-100 px-4 py-2 font-semibold sticky top-[60px] z-10">
                            {day}
                          </div>

                          {schedules.map((sched, i) => (
                            <div
                              key={i}
                              className="p-4 flex justify-between hover:bg-gray-50"
                            >

                              <span className="text-sm">
                                {formatTime(sched.start_time)} - {formatTime(sched.end_time)}
                              </span>

                              <span className="font-medium">
                                {sched.subject}
                              </span>

                              <span className="text-gray-500 text-sm">
                                {sched.room}
                              </span>

                            </div>
                          ))}

                        </div>
                      ))}

                    </div>

                  </div>

                </div>

              </div>
            )}

          </DialogContent>
        </Dialog>

      </div>
    </AppLayout >
  )
}