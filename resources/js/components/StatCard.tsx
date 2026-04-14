

export default function StatCard({ title, value, icon: Icon }: any) {
    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm flex justify-between items-center">
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <h2 className="text-2xl font-bold">{value}</h2>
            </div>

            {Icon && (
                <Icon className="text-gray-400" size={20} />
            )}
        </div>
    )
}