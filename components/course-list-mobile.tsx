import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"

interface Course {
  nombre: string
  fecha: string
  categoria: string
}

interface CourseListMobileProps {
  courses: Course[]
  categoryColors: Record<string, string>
}

export function CourseListMobile({ courses, categoryColors }: CourseListMobileProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 6

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.categoria))).sort()
  }, [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || course.categoria === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [courses, searchTerm, categoryFilter])

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredCourses, currentPage])

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Lista de Cursos Completados</CardTitle>
        <CardDescription>
          Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
          {Math.min(currentPage * itemsPerPage, filteredCourses.length)} de {filteredCourses.length}{" "}
          cursos
        </CardDescription>

        <div className="flex flex-col gap-3 mt-4">
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
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
        <div className="space-y-4">
          {paginatedCourses.map((course, index) => (
            <Card key={index} className="border border-border/50 hover:border-border transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground leading-snug">{course.nombre}</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
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
                      <span className="text-sm text-muted-foreground">{formatDate(course.fecha)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
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