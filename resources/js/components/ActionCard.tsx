export default function ActionCard({ title, description, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer rounded-xl border p-4 hover:bg-muted transition"
        >
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}