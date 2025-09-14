import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ArrowUpDown, Filter } from "lucide-react"

interface Course {
  nombre: string
  fecha: string
  categoria: string
}

type SortField = "nombre" | "fecha" | "categoria"
type SortOrder = "asc" | "desc"

interface CourseTableProps {
  courses: Course[]
  categoryColors: Record<string, string>
}

export function CourseTable({ courses, categoryColors }: CourseTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("fecha")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 10

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.categoria))).sort()
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

  return (
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
                        backgroundColor: `color-mix(in srgb, ${categoryColors[course.categoria] || "var(--color-chart-1)"} 20%, transparent)`,
                        color: categoryColors[course.categoria] || "var(--color-chart-1)",
                        border: `1px solid color-mix(in srgb, ${categoryColors[course.categoria] || "var(--color-chart-1)"} 40%, transparent)`,
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
  )
}