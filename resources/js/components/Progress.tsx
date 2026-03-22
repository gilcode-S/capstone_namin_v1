export default function Progress({ label, value }: any) {
    return (
        <div>
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span className="text-muted-foreground">
                    {value}% {value > 90 ? 'Excellent' : value > 75 ? 'Good' : 'Needs Improvement'}
                </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div
                    className="h-2 bg-black rounded-full transition-all"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    )
}