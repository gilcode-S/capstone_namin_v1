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
    return (
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
            {links.map((link, index) => (
                <button
                    key={index}
                    disabled={!link.url}
                    onClick={() => link.url && router.visit(link.url)}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 border rounded text-sm
                        ${link.active
                            ? "bg-blue-600 text-white"
                            : "bg-white hover:bg-gray-100"}
                        ${!link.url ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                />
            ))}
        </div>
    )
}