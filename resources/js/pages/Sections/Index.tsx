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

interface Section {
  id: number
  program_id: number
  section_name: string
  year_level: number
  student_count: number
  program: Program
}

const emptyForm = {
  program_id: '',
  section_name: '',
  year_level: '',
  student_count: ''
}

export default function Index() {

  const { sections, programs } = usePage().props as unknown as {
    sections: {
      data: Section[],
      links: any[],
    },
    programs: Program[]
  }

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

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
      section_name: section.section_name,
      year_level: section.year_level,
      student_count: section.student_count
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
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
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

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 text-left">Program</th>
                <th className="px-4 py-2 text-left">Section</th>
                <th className="px-4 py-2 text-left">Year Level</th>
                <th className="px-4 py-2 text-left">Students</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sections.data.length > 0 ? sections.data.map(section => (
                <tr key={section.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">
                    {section.program.program_name}
                  </td>
                  <td className="px-4 py-2">
                    {section.section_name}
                  </td>
                  <td className="px-4 py-2">
                    {section.year_level}
                  </td>
                  <td className="px-4 py-2">
                    {section.student_count}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleOpenEdit(section)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No Sections Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination links={sections.links}/>

        {/* MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Edit Section" : "Add Section"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* PROGRAM */}
              <div>
                <Label>Program</Label>
                <select
                  name="program_id"
                  value={form.program_id}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-2"
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.program_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SECTION NAME */}
              <div>
                <Label>Section Name</Label>
                <Input
                  name="section_name"
                  value={form.section_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* YEAR LEVEL */}
              <div>
                <Label>Year Level</Label>
                <select
                  name="year_level"
                  value={form.year_level}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-2"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              {/* STUDENT COUNT */}
              <div>
                <Label>Student Count</Label>
                <Input
                  type="number"
                  name="student_count"
                  value={form.student_count}
                  onChange={handleChange}
                />
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