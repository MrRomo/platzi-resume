"use client"

import { useState, useMemo } from "react"
import { DashboardMetrics } from "./dashboard-metrics"
import { DashboardCharts } from "./dashboard-charts"
import { CourseTable } from "./course-table"
import { CourseListMobile } from "./course-list-mobile"
import coursesData from "@/data/platzi-courses.json"

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

  const courses: Course[] = coursesData.cursos
  const totalCourses = courses.length

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

      <DashboardCharts
        dateChartData={dateChartData}
        categoryChartData={categoryChartData}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        totalCourses={totalCourses}
      />

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <CourseTable courses={courses} categoryColors={CATEGORY_COLORS} />
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden">
        <CourseListMobile courses={courses} categoryColors={CATEGORY_COLORS} />
      </div>
    </div>
  )
}