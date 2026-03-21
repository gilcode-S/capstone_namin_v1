import { Card, CardContent} from '@/components/ui/card'
export default function SummaryCard({ title, value, danger }: any) {
    return (
        <Card className="rounded-2xl">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{title}</p>
                <h3 className={`text-2xl font-semibold ${danger ? 'text-red-600' : ''}`}>
                    {value}
                </h3>
            </CardContent>
        </Card>
    )
}