import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Award } from "lucide-react"

interface DashboardMetricsProps {
  totalCourses: number
  totalCategories: number
  activeYears: number
}

export function DashboardMetrics({ totalCourses, totalCategories, activeYears }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cursos</CardTitle>
          <BookOpen className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalCourses}</div>
          <p className="text-xs text-muted-foreground">Completados exitosamente</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Categorías</CardTitle>
          <Award className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalCategories}</div>
          <p className="text-xs text-muted-foreground">Áreas de conocimiento</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Años Activos</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{activeYears}</div>
          <p className="text-xs text-muted-foreground">De aprendizaje continuo</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">2018-2024</div>
          <p className="text-xs text-muted-foreground">Rango temporal</p>
        </CardContent>
      </Card>
    </div>
  )
}