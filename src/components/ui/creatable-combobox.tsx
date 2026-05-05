"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  id: string | number
  name: string
}

interface CreatableComboboxProps {
  options: Option[]
  value?: string | number
  onSelect: (value: string | number | null, name: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  icon?: React.ReactNode
  newName?: string
}

export function CreatableCombobox({
  options,
  value,
  onSelect,
  placeholder = "Seleccionar...",
  emptyMessage = "No se encontraron resultados.",
  className,
  icon,
  newName,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = options.find((option) => option.id.toString() === value?.toString())

  const isNew = searchValue.length > 0 && !options.some(
    (option) => option.name.toLowerCase() === searchValue.toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm font-normal",
            className
          )}
        >
          <div className="flex items-center gap-3 truncate">
            {icon}
            <span className={cn("truncate", !selectedOption && !newName && "text-slate-400")}>
              {selectedOption ? selectedOption.name : (newName || placeholder)}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-2xl border-slate-100 overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-64 no-scrollbar">
            <CommandEmpty className="py-2 px-1">
              {isNew ? (
                <div 
                  className="relative flex cursor-default select-none items-center gap-2 rounded-xl px-2 py-3 text-sm outline-none bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    onSelect(null, searchValue)
                    setOpen(false)
                    setSearchValue("")
                  }}
                >
                  <Plus className="size-4" />
                  <span>Crear nuevo: "{searchValue}"</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">{emptyMessage}</p>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onSelect(option.id, option.name)
                    setOpen(false)
                    setSearchValue("")
                  }}
                  className="rounded-xl my-1 px-3 py-2.5"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value?.toString() === option.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
