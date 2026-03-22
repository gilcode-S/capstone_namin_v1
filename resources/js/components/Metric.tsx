import { Card, CardContent } from '@/components/ui/card'
export default function Metric({ icon: Icon, title, value, subtitle }: any) {
    return (
        <Card className="rounded-2xl">
            <CardContent className="p-4 flex justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <h3 className="text-xl font-semibold">{value}</h3>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <Icon className="text-muted-foreground" size={20} />
            </CardContent>
        </Card>
    )
}