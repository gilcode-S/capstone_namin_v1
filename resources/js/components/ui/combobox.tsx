import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboBoxItem {
  value: string
  label: string
}

interface ComboBoxProps {
  items: ComboBoxItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function ComboBox({
  items,
  value,
  onChange,
  placeholder = "Select option",
}: ComboBoxProps) {

  const [open, setOpen] = useState(false)

  const selected = items.find((item) => item.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>

      <PopoverTrigger asChild>

        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >

          {selected ? selected.label : placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />

        </Button>

      </PopoverTrigger>

      <PopoverContent className="w-full p-0">

        <Command>

          <CommandInput placeholder="Search..." />

          <CommandEmpty>No result found.</CommandEmpty>

          <CommandGroup className="max-h-60 overflow-y-auto">

            {items.map((item) => (

              <CommandItem
                key={item.value}
                value={item.label}
                onSelect={() => {

                  onChange(item.value)
                  setOpen(false)

                }}
              >

                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />

                {item.label}

              </CommandItem>

            ))}

          </CommandGroup>

        </Command>

      </PopoverContent>

    </Popover>
  )
}