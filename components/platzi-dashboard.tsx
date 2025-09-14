"use client"

import { useState, useMemo, lazy, Suspense, useEffect } from "react"
import { DashboardMetrics } from "./dashboard-metrics"

const DashboardCharts = lazy(() => import("./dashboard-charts").then(module => ({ default: module.DashboardCharts })))
const CourseTable = lazy(() => import("./course-table").then(module => ({ default: module.CourseTable })))
const CourseListMobile = lazy(() => import("./course-list-mobile").then(module => ({ default: module.CourseListMobile })))

interface Course {
  nombre: string
  fecha: string
  categoria: string
}

type DateFilter = "year" | "month-year"

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
  const [dateFilter, setDateFilter] = useState<DateFilter>("year")
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const totalCourses = courses.length

  useEffect(() => {
    // Dynamic import of data
    import("@/data/platzi-courses.json")
      .then(module => {
        setCourses(module.default.cursos)
        setIsLoading(false)
      })
      .catch(console.error)
  }, [])

  const metrics = useMemo(() => {
    const categoriesSet = new Set(courses.map((course) => course.categoria))
    const years = new Set(courses.map((course) => new Date(course.fecha).getFullYear()))

    return {
      totalCourses,
      totalCategories: categoriesSet.size,
      activeYears: years.size,
    }
  }, [courses, totalCourses])

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

  if (isLoading) {
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
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px] bg-muted/50 animate-pulse rounded-lg" />
          <div className="h-[500px] bg-muted/50 animate-pulse rounded-lg" />
        </div>
        <div className="h-96 bg-muted/50 animate-pulse rounded-lg" />
      </div>
    )
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

      <DashboardMetrics
        totalCourses={metrics.totalCourses}
        totalCategories={metrics.totalCategories}
        activeYears={metrics.activeYears}
      />

      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px] bg-muted/50 animate-pulse rounded-lg" />
          <div className="h-[500px] bg-muted/50 animate-pulse rounded-lg" />
        </div>
      }>
        <DashboardCharts
          dateChartData={dateChartData}
          categoryChartData={categoryChartData}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          totalCourses={totalCourses}
        />
      </Suspense>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Suspense fallback={<div className="h-96 bg-muted/50 animate-pulse rounded-lg" />}>
          <CourseTable courses={courses} categoryColors={CATEGORY_COLORS} />
        </Suspense>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden">
        <Suspense fallback={<div className="space-y-4">{Array.from({length: 6}).map((_, i) => <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />)}</div>}>
          <CourseListMobile courses={courses} categoryColors={CATEGORY_COLORS} />
        </Suspense>
      </div>
    </div>
  )
}