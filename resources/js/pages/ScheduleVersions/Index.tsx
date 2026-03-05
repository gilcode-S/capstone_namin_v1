import { Head, router, usePage } from '@inertiajs/react'
import { Plus, CheckCircle, Trash2, GitBranch } from 'lucide-react'
import { useState } from 'react'

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

interface Semester {
  id: number
  school_year: string
  semester: string
}

interface Creator {
  id: number
  name: string
}

interface Version {
  id: number
  version_number: number
  is_active: boolean
  semester: Semester
  creator: Creator
}

export default function Index() {

  const { versions, semesters } = usePage().props as unknown as {
    versions: Version[]
    semesters: Semester[]
  }

  const [open, setOpen] = useState(false)
  const [semesterId, setSemesterId] = useState('')
  const [loading, setLoading] = useState(false)

  /* -------------------------
     CREATE VERSION
  -------------------------*/

  const createVersion = () => {

    if (!semesterId) {
      alert("Select semester first")
      return
    }

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

  /* -------------------------
     ACTIVATE VERSION
  -------------------------*/

  const activateVersion = (id: number) => {

    if (!confirm("Activate this schedule version?")) return

    router.put(`/schedule-versions/${id}/active`)
  }

  /* -------------------------
     DELETE VERSION
  -------------------------*/

  const deleteVersion = (id: number) => {

    if (!confirm("Delete this version?")) return

    router.delete(`/schedule-versions/${id}`)
  }

  return (
    <AppLayout breadcrumbs={[{ title: "Schedule Versions", href: "/schedule-versions" }]}>
      <Head title="Schedule Versions" />

      <div className="p-6">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <div className="flex items-center gap-2">
            <GitBranch className="text-blue-500" />
            <h1 className="text-2xl font-bold">Schedule Versions</h1>
          </div>

          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus size={18}/>
            Create Version
          </Button>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto rounded-lg border shadow">

          <table className="min-w-full">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Semester</th>
                <th className="px-4 py-2 text-left">Version</th>
                <th className="px-4 py-2 text-left">Created By</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>

              {versions.length > 0 ? versions.map(v => (

                <tr key={v.id} className="border-t">

                  <td className="px-4 py-2">
                    {v.semester.school_year} — {v.semester.semester}
                  </td>

                  <td className="px-4 py-2">
                    v{v.version_number}
                  </td>

                  <td className="px-4 py-2">
                    {v.creator?.name}
                  </td>

                  <td className="px-4 py-2">

                    {v.is_active ? (
                      <span className="text-green-600 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Draft
                      </span>
                    )}

                  </td>

                  <td className="px-4 py-2 text-center flex justify-center gap-2">

                    {!v.is_active && (

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateVersion(v.id)}
                      >
                        <CheckCircle size={16}/>
                      </Button>

                    )}

                    {!v.is_active && (

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteVersion(v.id)}
                      >
                        <Trash2 size={16}/>
                      </Button>

                    )}

                  </td>

                </tr>

              )) : (

                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No schedule versions found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* CREATE VERSION MODAL */}

        <Dialog open={open} onOpenChange={setOpen}>

          <DialogContent>

            <DialogHeader>
              <DialogTitle>Create Schedule Version</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

              <div>

                <Label>Semester</Label>

                <select
                  className="w-full border rounded px-2 py-2"
                  value={semesterId}
                  onChange={(e) => setSemesterId(e.target.value)}
                >

                  <option value="">Select Semester</option>

                  {semesters.map(s => (

                    <option key={s.id} value={s.id}>
                      {s.school_year} — {s.semester}
                    </option>

                  ))}

                </select>

              </div>

            </div>

            <DialogFooter>

              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={createVersion}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Version"}
              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      </div>
    </AppLayout>
  )
}