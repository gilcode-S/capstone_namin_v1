import { Head, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { Plus, GitBranch } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'

/* ================= TYPES ================= */

interface Semester {
  id: number
  school_year: string
  term: string
}

interface Creator {
  id: number
  name: string
}

interface Version {
  id: number
  version_number: number
  is_active: number
  created_at: string
  semester?: Semester
  creator?: Creator
}

/* ================= PAGE ================= */

export default function Index() {

  const { versions = [], semesters = [] } = usePage().props as any

  const [open, setOpen] = useState(false)
  const [semesterId, setSemesterId] = useState('')
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    academic_year: '',
    semester: ''
  })

  /* ================= CREATE VERSION ================= */

  const createVersion = () => {

    if (!semesterId) return alert('Select semester first')

    setLoading(true)

    router.post('/schedule-versions', {
      semester_id: semesterId
    }, {
      onSuccess: () => {
        setSemesterId('')
        setOpen(false)
        setLoading(false)
      },
      onError: () => setLoading(false)
    })
  }

  /* ================= ACTIONS ================= */

  const activateVersion = (id: number) => {
    if (!confirm('Activate this version?')) return
    router.put(`/schedule-versions/${id}/active`)
  }

  const deleteVersion = (id: number) => {
    if (!confirm('Delete this version?')) return
    router.delete(`/schedule-versions/${id}`)
  }

  const viewSchedule = (id: number) => {
    router.get('/schedules', { version_id: id })
  }

  const viewLogs = (id: number) => {
    router.get(`/schedule-versions/${id}/logs`)
  }

  /* ================= FILTERING ================= */

  const filteredVersions = versions.filter((v: Version) => {

    const yearMatch =
      !filters.academic_year ||
      v.semester?.school_year === filters.academic_year

    const semesterMatch =
      !filters.semester ||
      v.semester?.term === filters.semester

    return yearMatch && semesterMatch
  })
  const formatDate = (date: string) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /* ================= UI ================= */

  return (
    <AppLayout breadcrumbs={[{ title: "Schedule Versions", href: "/schedule-versions" }]}>

      <Head title="Schedule Versions" />

      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

        {/* ================= HEADER ================= */}

        <div className="flex justify-between items-center">

          <div className="flex items-center gap-2">
            <GitBranch className="text-blue-500" />
            <h1 className="text-2xl font-bold">Schedule Version History <br /> </h1>
          
         
          </div>

          {/* <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus size={18} />
            Create Version
          </Button> */}

        </div>

        {/* ================= FILTERS ================= */}

        <div className="bg-white p-4 rounded-xl border grid grid-cols-2 gap-3">

          <select
            className="border p-2 rounded"
            value={filters.academic_year}
            onChange={(e) =>
              setFilters({ ...filters, academic_year: e.target.value })
            }
          >
            <option value="">Academic Year</option>
            {[...new Set(versions.map(v => v.semester?.school_year))].map((y: any) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={filters.semester}
            onChange={(e) =>
              setFilters({ ...filters, semester: e.target.value })
            }
          >
            <option value="">Semester</option>
            {[...new Set(versions.map(v => v.semester?.term))].map((s: any) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

        </div>

        {/* ================= VERSION CARDS ================= */}

        <div className="space-y-4">

          {filteredVersions.length > 0 ? (
            filteredVersions.map((v: Version) => (

              <div
                key={v.id}
                className="bg-white border rounded-xl p-5 flex justify-between items-center shadow-sm"
              >

                {/* LEFT INFO */}
                <div>

                  <h2 className="text-2xl font-bold">
                    {v.semester?.school_year ?? 'N/A'} — {v.semester?.term?.toUpperCase() ?? ''} - SEMESTER
                  </h2>
                  <div className="text-lg text-gray-500 mt-2 space-y-1 font-bold flex justify-between gap-4">

                    <p>
                      <span className="font-medium">Created:</span> {formatDate(v.created_at)}
                    </p>

                    <p>
                      <span className="font-medium">Effective:</span> {formatDate(v.semester?.start_date)}
                    </p>

                  </div>

                  {/* {v.is_active ? (
                  <span className="text-green-600 font-semibold text-sm">
                    Active
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">
                    Draft
                  </span>
                )} */}

                </div>

                {/* ACTIONS */}
                <div className="flex gap-2" >

                  <Button
                    variant="default"
                    onClick={() => viewSchedule(v.id)}
                  >
                    View Schedule
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => viewLogs(v.id)}
                  >
                    View Logs
                  </Button>

                  {!v.is_active && (
                    <Button
                      variant="outline"
                      onClick={() => activateVersion(v.id)}
                    >
                      Activate
                    </Button>
                  )}

                  {!v.is_active && (
                    <Button
                      variant="destructive"
                      onClick={() => deleteVersion(v.id)}
                    >
                      Delete
                    </Button>
                  )}

                </div>

              </div>

            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              No schedule versions found
            </div>
          )}

        </div>

        {/* ================= CREATE MODAL ================= */}

        <Dialog open={open} onOpenChange={setOpen}>

          <DialogContent>

            <DialogHeader>
              <DialogTitle>Create Schedule Version</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

              <div>

                <Label>Semester</Label>

                <select
                  className="w-full border rounded p-2"
                  value={semesterId}
                  onChange={(e) => setSemesterId(e.target.value)}
                >

                  <option value="">Select Semester</option>

                  {semesters.map((s: Semester) => (
                    <option key={s.id} value={s.id}>
                      {s.school_year} — {s.term}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            <DialogFooter>

              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <Button onClick={createVersion} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      </div >
    </AppLayout >
  )
}