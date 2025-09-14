import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface DateChartData {
  date: string
  count: number
}

interface CategoryChartData {
  name: string
  value: number
  color: string
}

type DateFilter = "year" | "month-year"

interface DashboardChartsProps {
  dateChartData: DateChartData[]
  categoryChartData: CategoryChartData[]
  dateFilter: DateFilter
  onDateFilterChange: (filter: DateFilter) => void
  totalCourses: number
}

export function DashboardCharts({
  dateChartData,
  categoryChartData,
  dateFilter,
  onDateFilterChange,
  totalCourses
}: DashboardChartsProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} cursos ({((data.value / totalCourses) * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Cursos por Fecha</CardTitle>
              <CardDescription>Distribución temporal de cursos completados</CardDescription>
            </div>
            <Select value={dateFilter} onValueChange={onDateFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Por Año</SelectItem>
                <SelectItem value="month-year">Por Mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={dateChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Cursos por Categoría</CardTitle>
          <CardDescription>Distribución de cursos por área de conocimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryChartData} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" dataKey="value">
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-row flex-wrap justify-center">
              {categoryChartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1 mx-2 py-1">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{entry.name} ({entry.value}) </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}