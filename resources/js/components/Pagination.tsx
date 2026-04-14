import { router } from '@inertiajs/react'

interface Link {
  url: string | null
  label: string
  active: boolean
}

interface PaginationProps {
  links: Link[]
}

export default function Pagination({ links }: PaginationProps) {
  if (!links || links.length === 0) return null

  return (
    <div className="mt-6 flex justify-center gap-1 flex-wrap">

      {links.map((link, index) => {

        // "..." separator
        if (!link.url) {
          return (
            <span
              key={index}
              className="px-3 py-1 text-gray-400 text-sm"
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          )
        }

        return (
          <button
            key={index}
            onClick={() =>
              router.visit(link.url!, {
                preserveState: true,
                preserveScroll: true
              })
            }
            dangerouslySetInnerHTML={{ __html: link.label }}
            className={`
              px-3 py-1 text-sm rounded-md border transition
              ${link.active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-100 text-gray-700"}
            `}
          />
        )
      })}
    </div>
  )
}