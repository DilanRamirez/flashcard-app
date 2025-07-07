"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import type { Flashcard } from "@/app/page"

interface FilterPanelProps {
  cards: Flashcard[]
  searchQuery: string
  filters: {
    category: string
    subject: string
    course: string
    module: string
    difficulty: string
  }
  onSearchChange: (query: string) => void
  onFilterChange: (filters: FilterPanelProps["filters"]) => void
  onReset: () => void
}

export function FilterPanel({
  cards,
  searchQuery,
  filters,
  onSearchChange,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  // Get unique values for filter options
  const categories = [...new Set(cards.map((card) => card.category))].sort()
  const subjects = [...new Set(cards.map((card) => card.subject))].sort()
  const courses = [...new Set(cards.map((card) => card.course))].sort()
  const modules = [...new Set(cards.map((card) => card.module))].sort()
  const difficulties = [...new Set(cards.map((card) => card.difficulty).filter(Boolean))].sort()

  const hasActiveFilters = searchQuery || Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ ...filters, category: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select
          value={filters.subject}
          onValueChange={(value) => onFilterChange({ ...filters, subject: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Filter */}
      <div className="space-y-2">
        <Label>Course</Label>
        <Select
          value={filters.course}
          onValueChange={(value) => onFilterChange({ ...filters, course: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Module Filter */}
      <div className="space-y-2">
        <Label>Module</Label>
        <Select
          value={filters.module}
          onValueChange={(value) => onFilterChange({ ...filters, module: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module} value={module}>
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      {difficulties.length > 0 && (
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={filters.difficulty}
            onValueChange={(value) => onFilterChange({ ...filters, difficulty: value === "all" ? "" : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
