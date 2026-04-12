import { Head, router, usePage } from '@inertiajs/react'
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react'
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
interface Program {
  id: number
  program_name: string
}

interface Semester {
  id: number
  school_year: string
  term: string
}

interface Section {
  id: number
  program_id: number
  semester_id: number
  section_name: string
  year_level: number
  student_count: number
  shift: string
  octoberian: boolean
  program: Program
  semester: Semester
}


const emptyForm = {
  program_id: '',
  semester_id: '',
  section_name: '',
  year_level: '',
  student_count: '',
  shift: '',
  octoberian: false,
}

export default function Index() {

  const { sections, programs, stats, semesters, filters: initialFilters, view: initialView, } = usePage().props as unknown as {
    sections: {
      data: Section[],
      links: any[],
    },
    programs: Program[],
    semesters: Semester[]
  }

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  // const { filters: initialFilters } = usePage().props as any

  const [view, setView] = useState<'grid' | 'section' | 'teacher'>(
    initialView || 'grid'
  )


  const [filters, setFilters] = useState({
    set: initialFilters?.set || 'A',
    program: initialFilters?.program || '',
    shift: initialFilters?.shift || '',
    section: initialFilters?.section || '',
  })

  // const [filters, setFilter] = useState({
  //   section: "",
  //   shift: "",
  //   program: "",
  // });

  const handleViewChange = (value: 'grid' | 'section' | 'teacher') => {
    setView(value)

    router.get('/section', {
      ...filters,
      view: value
    }, {
      preserveState: true,
      replace: true,
    })
  }
  const handleFilterChange = (name: string, value: string) => {
    const updated = { ...filters, [name]: value }
    setFilters(updated)

    router.get('/section', updated, {
      preserveState: true,
      replace: true,
    })
  }

  // OPEN CREATE
  const handleOpen = () => {
    setForm(emptyForm)
    setIsEdit(false)
    setEditId(null)
    setOpen(true)
  }

  // OPEN EDIT
  const handleOpenEdit = (section: Section) => {
    setForm({
      program_id: section.program_id,
      semester_id: section.semester_id,
      section_name: section.section_name,
      year_level: section.year_level,
      student_count: section.student_count,
      shift: section.shift,
      octoberian: section.octoberian ?? false
    })

    setIsEdit(true)
    setEditId(section.id)
    setOpen(true)
  }

  // CLOSE MODAL
  const handleClose = () => {
    setForm(emptyForm)
    setIsEdit(false)
    setEditId(null)
    setOpen(false)
  }

  // INPUT CHANGE
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm({ ...form, [name]: checked })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  // SUBMIT
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isEdit && editId) {
      router.put(`/section/${editId}`, form, {
        onSuccess: () => {
          setLoading(false)
          handleClose()
        },
        onError: () => setLoading(false)
      })
    } else {
      router.post('/section', form, {
        onSuccess: () => {
          setLoading(false)
          handleClose()
        },
        onError: () => setLoading(false)
      })
    }
  }

  // DELETE
  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    router.delete(`/section/${id}`)
  }
  
  const mockRooms = [
    { id: 1, name: 'Room 101' },
    { id: 2, name: 'Room 102' },
    { id: 3, name: 'Room 103' },
    { id: 4, name: 'Room 104' },
  ]
  const timeSlots = [
    '7:00 AM - 8:00 AM',
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
  ]
  return (
    <AppLayout breadcrumbs={[{ title: "Sections", href: '/section' }]}>
      <Head title="Sections" />

      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Layers className="mr-2 text-purple-500" size={28} />
            <h1 className="text-2xl font-bold">Manage Sections</h1>
          </div>

          <Button onClick={handleOpen} className="gap-2">
            <Plus size={18} />
            Add Section
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* TOTAL CLASSES */}
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <p className="text-sm text-gray-500">Total Classes</p>
            <h2 className="text-2xl font-bold">
              {stats?.total_classes ?? 0}
            </h2>
          </div>

          {/* WEEKLY HOURS */}
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <p className="text-sm text-gray-500">Weekly Hours</p>
            <h2 className="text-2xl font-bold">
              {stats?.weekly_hours ?? 0}
            </h2>
          </div>

          {/* ACTIVE ROOMS */}
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <p className="text-sm text-gray-500">Active Rooms</p>
            <h2 className="text-2xl font-bold">
              {stats?.active_rooms ?? 0}
            </h2>
          </div>

          {/* TOTAL SECTIONS */}
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <p className="text-sm text-gray-500">Total Sections</p>
            <h2 className="text-2xl font-bold">
              {stats?.total_sections ?? 0}
            </h2>
          </div>

        </div>

        {/* FILTER BAR */}
        {/* FILTER BAR (FIGMA MATCH) */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-6">

          <p className="text-sm text-gray-500 mb-3">Filters</p>

          <div className="flex flex-wrap gap-4">

            {/* SET */}
            <select
              className="px-4 py-2 rounded-full bg-white border text-sm shadow-sm"
              value={filters.set}
              onChange={(e) => handleFilterChange('set', e.target.value)}
            >
              <option value="A">Set A</option>
              <option value="B">Set B</option>
            </select>

            {/* DEPARTMENT */}
            <select
              className="px-4 py-2 rounded-full bg-white border text-sm shadow-sm"
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
            >
              <option value="">All Department</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.program_name}
                </option>
              ))}
            </select>

            {/* SHIFT */}
            <select
              className="px-4 py-2 rounded-full bg-white border text-sm shadow-sm"
              value={filters.shift}
              onChange={(e) => handleFilterChange('shift', e.target.value)}
            >
              <option value="">All Shift</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>

            {/* SECTION */}
            <select
              className="px-4 py-2 rounded-full bg-white border text-sm shadow-sm"
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
            >
              <option value="">All Section</option>
              {sections.data.map(sec => (
                <option key={sec.id} value={sec.section_name}>
                  {sec.section_name}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="bg-gray-200 rounded-2xl p-1 mb-4 flex">

          {/* GRID */}
          <button
            onClick={() => handleViewChange('grid')}
            className={`flex-1 text-sm py-2 rounded-xl transition ${view === 'grid'
              ? 'bg-white shadow font-medium'
              : 'text-gray-600'
              }`}
          >
            GRID
          </button>

          {/* BY SECTION */}
          <button
            onClick={() => handleViewChange('section')}
            className={`flex-1 text-sm py-2 rounded-xl transition ${view === 'section'
              ? 'bg-white shadow font-medium'
              : 'text-gray-600'
              }`}
          >
            By Section
          </button>

          {/* BY TEACHER */}
          <button
            onClick={() => handleViewChange('teacher')}
            className={`flex-1 text-sm py-2 rounded-xl transition ${view === 'teacher'
              ? 'bg-white shadow font-medium'
              : 'text-gray-600'
              }`}
          >
            By Teacher
          </button>

        </div>
        {view === 'grid' && (
          <div className="overflow-auto rounded-xl border bg-white">

  <table className="min-w-full border-collapse text-[11px]">

    {/* ================= HEADER ================= */}
    <thead>

      {/* SET TITLE */}
      <tr>
        <th colSpan={mockRooms.length * 2 + 1} className="border text-center py-2 font-semibold bg-gray-100">
          Set {filters.set}
        </th>
      </tr>

      {/* BUILDING */}
      <tr>
        <th className="border w-20"></th>
        <th colSpan={mockRooms.length * 2} className="border text-center py-1 bg-gray-50">
          BUILDING 1
        </th>
      </tr>

      {/* ROOM NAMES */}
      <tr>
        <th className="border w-20">MONDAY</th>

        {mockRooms.map(room => (
          <th
            key={room.id}
            colSpan={2}
            className="border text-center py-1 bg-gray-50"
          >
            {room.name.toUpperCase()}
          </th>
        ))}
      </tr>

      {/* TEACHER / SECTION */}
      <tr>
        <th className="border text-[10px]">MORNING</th>

        {mockRooms.map(room => (
          <>
            <th key={`${room.id}-t`} className="border text-[10px]">TEACHER</th>
            <th key={`${room.id}-s`} className="border text-[10px]">SECTION</th>
          </>
        ))}
      </tr>

    </thead>

    {/* ================= BODY ================= */}
    <tbody>

      {timeSlots.slice(0, 5).map((time, i) => {
        const [start] = time.split(' - ')

        return (
          <tr key={i}>

            {/* TIME */}
            <td className="border px-2 py-1 text-[10px] bg-gray-50">
              {start}
            </td>

            {/* CELLS */}
            {mockRooms.map(room => (
              <>
                {/* TEACHER CELL */}
                <td className="border text-center text-gray-400 h-8">
                  TEACHER
                </td>

                {/* SECTION CELL */}
                <td className="border text-center text-gray-400">
                  SECTION
                </td>
              </>
            ))}

          </tr>
        )
      })}

      {/* AFTERNOON LABEL */}
      <tr>
        <td className="border font-semibold bg-gray-100 text-center">
          AFTERNOON
        </td>
        <td colSpan={mockRooms.length * 2} className="border"></td>
      </tr>

      {/* AFTERNOON TIMES */}
      {timeSlots.slice(5).map((time, i) => {
        const [start] = time.split(' - ')

        return (
          <tr key={i}>
            <td className="border px-2 py-1 text-[10px] bg-gray-50">
              {start}
            </td>

            {mockRooms.map(room => (
              <>
                <td className="border text-center text-gray-400 h-8">
                  TEACHER
                </td>
                <td className="border text-center text-gray-400">
                  SECTION
                </td>
              </>
            ))}
          </tr>
        )
      })}

    </tbody>

  </table>
</div>
        )}

        {view === 'section' && (
          <div className="p-6 text-gray-500">
            Section View (coming next)
          </div>
        )}

        {view === 'teacher' && (
          <div className="p-6 text-gray-500">
            Teacher View (coming next)
          </div>
        )}

        <Pagination links={sections.links} />

        {/* MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit Section" : "Add New Section"}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Create a new section with scheduling requirements
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* COURSE */}
              <div>
                <Label>Course</Label>
                <select
                  name="program_id"
                  value={form.program_id}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">e.g. BS Computer Science, BS Accounting</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.program_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* GRID 2 COL */}
              <div className="grid grid-cols-2 gap-4">

                {/* YEAR */}
                <div>
                  <Label>Year</Label>
                  <select
                    name="year_level"
                    value={form.year_level}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">First Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* SEM */}
                <div>
                  <Label>Sem</Label>
                  <select
                    name="semester_id"
                    value={form.semester_id}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>
                        {sem.school_year} - {sem.term}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SHIFT */}
                <div>
                  <Label>Shift</Label>
                  <select
                    name="shift"
                    value={form.shift}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                </div>

                {/* SECTION */}
                <div>
                  <Label>Section</Label>
                  <Input
                    name="section_name"
                    placeholder="e.g. A, B, C"
                    value={form.section_name}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {/* CAPACITY */}
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  name="student_count"
                  placeholder="e.g. 40"
                  value={form.student_count}
                  onChange={handleChange}
                />
              </div>

              {/* CHECKBOX */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="octoberian"
                  checked={form.octoberian}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label className="text-sm">Octoberian</Label>
              </div>

              {/* FOOTER */}
              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                >
                  {loading
                    ? (isEdit ? "Saving..." : "Adding...")
                    : (isEdit ? "Save Changes" : "Add Section")}
                </Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}