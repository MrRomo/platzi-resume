"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Award, ArrowUpDown, Filter } from "lucide-react"
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import coursesData from "@/data/platzi-courses.json"

interface Course {
  nombre: string
  fecha: string
  categoria: string
}

type DateFilter = "year" | "month-year"
type SortField = "nombre" | "fecha" | "categoria"
type SortOrder = "asc" | "desc"

const CATEGORY_COLORS: Record<string, string> = {
  "Python/Data Science": "var(--color-chart-1)",
  "Desarrollo Web": "var(--color-chart-2)",
  "Sistemas/DevOps": "var(--color-chart-3)",
  "Programación General": "var(--color-chart-4)",
  "Criptomonedas/Blockchain": "var(--color-chart-5)",
  "Marketing/Negocios": "var(--color-chart-6)",
  "Hardware/IoT": "var(--color-chart-7)",
  Matemáticas: "var(--color-chart-8)",
  "Bases de Datos": "var(--color-chart-9)",
  "Machine Learning": "var(--color-chart-10)",
  Finanzas: "var(--color-chart-11)",
  "Cloud Computing": "var(--color-chart-12)",
}

export function PlatziDashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<DateFilter>("year")
  const [sortField, setSortField] = useState<SortField>("fecha")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 10

  const courses: Course[] = coursesData.cursos
  const totalCourses = courses.length

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.categoria))).sort()
  }, [courses])

  // Calcular métricas principales
  const metrics = useMemo(() => {
    const categoriesSet = new Set(courses.map((course) => course.categoria))
    const years = new Set(courses.map((course) => new Date(course.fecha).getFullYear()))
    const mostRecentCourse = courses.reduce((latest, course) =>
      new Date(course.fecha) > new Date(latest.fecha) ? course : latest,
    )

    return {
      totalCourses,
      totalCategories: categoriesSet.size,
      activeYears: years.size,
      mostRecentCourse: mostRecentCourse.nombre,
    }
  }, [courses, totalCourses])

  // Datos para gráfico de barras por fecha
  const dateChartData = useMemo(() => {
    const grouped = courses.reduce(
      (acc, course) => {
        const date = new Date(course.fecha)
        const key =
          dateFilter === "year"
            ? date.getFullYear().toString()
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [courses, dateFilter])

  // Datos para gráfico de torta por categoría
  const categoryChartData = useMemo(() => {
    const grouped = courses.reduce(
      (acc, course) => {
        acc[course.categoria] = (acc[course.categoria] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || "var(--color-chart-1)",
      }))
      .sort((a, b) => b.value - a.value)
  }, [courses])

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch =
        course.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || course.categoria === categoryFilter
      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "nombre":
          aValue = a.nombre.toLowerCase()
          bValue = b.nombre.toLowerCase()
          break
        case "fecha":
          aValue = new Date(a.fecha).getTime()
          bValue = new Date(b.fecha).getTime()
          break
        case "categoria":
          aValue = a.categoria.toLowerCase()
          bValue = b.categoria.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [courses, searchTerm, categoryFilter, sortField, sortOrder])

  // Paginación
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedCourses.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedCourses, currentPage])

  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setCurrentPage(1)
  }

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
    <div className="container mx-auto p-6 space-y-8 bg-background">
      <div className="text-center space-y-2 border-b border-border pb-8">
        <h1 className="text-4xl font-bold text-foreground">Trayectoria de Aprendizaje en Platzi</h1>
        <p className="text-lg text-muted-foreground">por Ricardo Romo</p>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Análisis completo del progreso académico desde 2018 hasta 2024
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Completados exitosamente</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categorías</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Áreas de conocimiento</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Años Activos</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.activeYears}</div>
            <p className="text-xs text-muted-foreground">De aprendizaje continuo</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Período</CardTitle>
            <CardDescription>Distribución de cursos por área de conocimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2018-2024</div>
            <p className="text-xs text-muted-foreground">Rango temporal</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por fecha */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Cursos por Fecha</CardTitle>
                <CardDescription>Distribución temporal de cursos completados</CardDescription>
              </div>
              <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
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
            <ResponsiveContainer width="100%" height={300}>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryChartData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Cursos Completados</CardTitle>
          <CardDescription>
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedCourses.length)} de {filteredAndSortedCourses.length}{" "}
            cursos
          </CardDescription>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="max-w-sm"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("nombre")}
                      className="font-medium text-muted-foreground hover:text-foreground"
                    >
                      Nombre del Curso
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("categoria")}
                      className="font-medium text-muted-foreground hover:text-foreground"
                    >
                      Categoría
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("fecha")}
                      className="font-medium text-muted-foreground hover:text-foreground"
                    >
                      Fecha de Finalización
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map((course, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{course.nombre}</div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[course.categoria] || "var(--color-chart-1)"}20`,
                          color: CATEGORY_COLORS[course.categoria] || "var(--color-chart-1)",
                          border: `1px solid ${CATEGORY_COLORS[course.categoria] || "var(--color-chart-1)"}40`,
                        }}
                      >
                        {course.categoria}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">{formatDate(course.fecha)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
