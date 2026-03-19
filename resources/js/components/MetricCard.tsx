import { Card, CardContent} from '@/components/ui/card'
export default function MetricCard({ icon: Icon, label, value, trend }: any) {
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <h3 className="text-2xl font-semibold">{value}</h3>
                    {trend && (
                        <p className="text-xs text-green-600">{trend}</p>
                    )}
                </div>
                <Icon className="text-indigo-600" />
            </CardContent>
        </Card>
    )
}