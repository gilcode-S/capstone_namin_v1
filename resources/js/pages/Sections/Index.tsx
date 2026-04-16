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
import StatCard from '@/components/StatCard'
interface Program {
  id: number
  program_name: string
  program_code: string // ✅ ADD THIS
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
  section_letter: '',
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

  const generatePreviewCode = () => {
    if (
      !form.program_id ||
      !form.year_level ||
      !form.shift ||
      !form.section_letter ||
      !form.semester_id
    ) return ''

    const program = programs.find(p => p.id == form.program_id)
    const semester = semesters.find(s => s.id == form.semester_id)

    if (!program || !semester) return ''


    const semNumberMap: any = {
      '1st': 1,
      '2nd': 2,
      'summer': 3,
    }

    const semNumber = semNumberMap[semester.term.toLowerCase()] || 1

    const yearBase =
      (form.year_level - 1) * 2 + semNumber

    const SHIFT_CODES: any = {
      Morning: 'M',
      Afternoon: 'D',
      Evening: 'E',
    }

    let code =
      program.program_code +
      yearBase +
      SHIFT_CODES[form.shift] +
      form.section_letter

    if (semester.term === 'summer') {
      code += '-S'
    }

    return code
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
      octoberian: section.octoberian ?? false,
      section_letter: section.section_name.slice(-1),
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

  // const mockRooms = [
  //   { id: 1, name: 'Room 101' },
  //   { id: 2, name: 'Room 102' },
  //   { id: 3, name: 'Room 103' },
  //   { id: 4, name: 'Room 104' },
  // ]
  // const timeSlots = [
  //   '7:00 AM - 8:00 AM',
  //   '8:00 AM - 9:00 AM',
  //   '9:00 AM - 10:00 AM',
  //   '10:00 AM - 11:00 AM',
  //   '11:00 AM - 12:00 PM',
  //   '1:00 PM - 2:00 PM',
  //   '2:00 PM - 3:00 PM',
  //   '3:00 PM - 4:00 PM',
  // ]
  return (
    <AppLayout breadcrumbs={[{ title: "Sections", href: '/section' }]}>
      <Head title="Sections" />

      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Section Management</h1>
            <p className="text-sm text-gray-500">
              Maintains section details, including course, year, student enrollment, and capacity limits.
            </p>
          </div>

          <Button onClick={handleOpen} className="bg-black text-white rounded-xl">
            + Add Section
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard title="Total Section" value={stats?.total_sections ?? 0} />
          <StatCard title="Total Student" value={85} />
          <StatCard title="Total Morning" value={85} />
          <StatCard title="Total Afternoon" value={85} />
          <StatCard title="Total Evening" value={85} />
        </div>

        {/* FILTER BAR */}
        {/* FILTER BAR (FIGMA MATCH) */}
        <div className="bg-white border rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-sm font-medium mb-3">Filters</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

            {/* SEARCH */}
            <Input
              placeholder="Search Section..."
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="h-10 rounded-lg"
            />

            {/* YEAR */}
            <select
              value={filters.year_level || ''}
              onChange={(e) => handleFilterChange('year_level', e.target.value)}
              className="h-10 rounded-lg border px-3"
            >
              <option value="">All Year</option>
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>

            {/* SHIFT */}
            <select
              value={filters.shift}
              onChange={(e) => handleFilterChange('shift', e.target.value)}
              className="h-10 rounded-lg border px-3"
            >
              <option value="">All Shift</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>

            {/* DEPARTMENT */}
            <select
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              className="h-10 rounded-lg border px-3"
            >
              <option value="">All Departments</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.program_name}
                </option>
              ))}
            </select>

            {/* PROGRAM */}
            <select className="h-10 rounded-lg border px-3">
              <option>All Program</option>
            </select>

          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm">

          {/* HEADER */}
          <div className="p-5 border-b">
            <h2 className="font-semibold text-lg">Section List</h2>
            <p className="text-sm text-gray-500">
              Provides a summary of sections, including course, year level, and student capacity.
            </p>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="text-gray-500 text-xs uppercase border-b">
                <tr>
                  <th className="px-6 py-3 text-left">Section</th>
                  <th className="px-6 py-3 text-left">Department</th>
                  <th className="px-6 py-3 text-left">Program</th>
                  <th className="px-6 py-3 text-left">Shift</th>
                  <th className="px-6 py-3 text-left">Year</th>
                  <th className="px-6 py-3 text-left">Capacity</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {sections.data.map((sec) => (
                  <tr key={sec.id} className="border-t hover:bg-gray-50">

                    {/* SECTION */}
                    <td className="px-6 py-4 font-medium">
                      {sec.section_name}
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {sec.program?.program_name}
                      </span>
                    </td>

                    {/* PROGRAM */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {sec.program?.program_name}
                      </span>
                    </td>

                    {/* SHIFT */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                        {sec.shift}
                      </span>
                    </td>

                    {/* YEAR */}
                    <td className="px-6 py-4 text-gray-600">
                      {sec.year_level === 1 ? 'First Year' :
                        sec.year_level === 2 ? 'Second Year' :
                          sec.year_level === 3 ? 'Third Year' : 'Fourth Year'}
                    </td>

                    {/* CAPACITY */}
                    <td className="px-6 py-4">
                      {sec.student_count || 0}
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(sec)}
                        >
                          <Pencil size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(sec.id)}
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

        <Pagination links={sections.links} />

        {/* MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl w-full rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit Section" : "Add New Section"}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Create a new section with scheduling requirements
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">

              {/* PROGRAM */}
              <div>
                <Label>Program</Label>
                <select
                  name="program_id"
                  value={form.program_id}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border px-3"
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

              {/* GRID */}
              <div className="grid grid-cols-2 gap-4">

                {/* YEAR */}
                <div>
                  <Label>Year</Label>
                  <select
                    name="year_level"
                    value={form.year_level}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border px-3"
                  >
                    <option value="">Select Year</option>
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
                    className="w-full h-11 rounded-lg border px-3"
                  >
                    <option value="">Semester</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>
                        {sem.term}
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
    className="w-full h-11 rounded-lg border px-3"
  >
    <option value="">Select Shift</option>
    <option value="Morning">Morning</option>
    <option value="Afternoon">Afternoon</option>
    <option value="Evening">Evening</option>
  </select>
</div>

{/* SECTION LETTER */}
<div>
  <Label>Section Letter</Label>
  <Input
    name="section_letter"
    placeholder="A, B, C"
    maxLength={1}
    value={form.section_letter}
    onChange={(e) =>
      setForm({
        ...form,
        section_letter: e.target.value.toUpperCase()
      })
    }
    className="h-11 rounded-lg"
  />
</div>

                <div className="col-span-2 bg-gray-50 border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Section Code Preview</p>
                  <p className="text-lg font-bold tracking-wide">
                    {generatePreviewCode() || '—'}
                  </p>
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
                  className="h-11 rounded-lg"
                />
              </div>

              {/* OCTOBERIAN */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="octoberian"
                  checked={form.octoberian}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <Label className="text-sm">Octoberian</Label>
              </div>

              {/* BUTTON */}
              <Button className="w-full h-12 rounded-xl">
                {loading
                  ? (isEdit ? "Saving..." : "Adding...")
                  : (isEdit ? "Save Changes" : "Add Section")}
              </Button>

            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  )
}