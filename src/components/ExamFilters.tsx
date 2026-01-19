import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Subject {
  id: string;
  name: string;
}

interface SortOption {
  id: string;
  name: string;
}

interface ExamFiltersProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions: SortOption[] = [
  { id: "popular", name: "জনপ্রিয়তা অনুসারে" },
  { id: "newest", name: "নতুন প্রথমে" },
  { id: "questions-high", name: "বেশি প্রশ্ন" },
  { id: "questions-low", name: "কম প্রশ্ন" },
  { id: "duration-high", name: "বেশি সময়" },
  { id: "duration-low", name: "কম সময়" },
];

const ExamFilters = ({
  subjects,
  selectedSubject,
  onSubjectChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: ExamFiltersProps) => {
  const currentSort = sortOptions.find((s) => s.id === sortBy) || sortOptions[0];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="এক্সাম খুঁজুন..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Subject Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSubject === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onSubjectChange("all")}
            className="rounded-full font-bengali"
          >
            সব
          </Button>
          {subjects.map((subject) => (
            <Button
              key={subject.id}
              variant={selectedSubject === subject.id ? "default" : "outline"}
              size="sm"
              onClick={() => onSubjectChange(subject.id)}
              className="rounded-full font-bengali"
            >
              {subject.name}
            </Button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 font-bengali">
              <SlidersHorizontal className="w-4 h-4" />
              {currentSort.name}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onSortChange(option.id)}
                className="font-bengali cursor-pointer"
              >
                {option.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ExamFilters;
