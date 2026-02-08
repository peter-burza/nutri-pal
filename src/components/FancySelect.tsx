"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check } from "lucide-react"

interface Option {
  id: string | number
  label: string
}

interface FancySelectProps {
  options: string[] | Option[]
  value: string
  onChange: (value: string) => void
  label?: string
}

export default function FancySelect({ options, value, onChange, label }: FancySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const normalizedOptions: Option[] = options.map(opt =>
    typeof opt === 'string' ? { id: opt, label: opt } : opt
  )

  const selectedOption = normalizedOptions.find(opt => opt.id === value) || normalizedOptions[0]

  useEffect(() => {
    setMounted(true)
    const handleClickOutside = (event: MouseEvent) => {
      const isDropdownClick = dropdownRef.current && dropdownRef.current.contains(event.target as Node)
      const isContainerClick = containerRef.current && containerRef.current.contains(event.target as Node)

      if (!isDropdownClick && !isContainerClick) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()

      // Calculate position relative to viewport
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
      })
    }
  }, [isOpen])

  // Update position on scroll/resize when open
  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDropdownStyle(prev => ({
          ...prev,
          top: `${rect.bottom + 8}px`,
          left: `${rect.left}px`,
        }))
      }
    }

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-xl border transition-all text-left p-3.5 cursor-pointer ${isOpen
          ? "border-indigo-500 ring-2 ring-indigo-500/10 bg-white"
          : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
          }`}
      >
        <span className={`font-bold transition-colors ${isOpen ? "text-indigo-600" : "text-slate-700"}`}>
          {selectedOption.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
      </button>

      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white rounded-2xl border border-slate-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {normalizedOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id.toString())
                  setIsOpen(false)
                }}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-all mb-1 last:mb-0 text-left cursor-pointer ${value === option.id
                  ? "text-indigo-600 bg-indigo-50 font-extrabold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-500"
                  }`}
              >
                <span className="relative z-10">{option.label}</span>
                {value === option.id && <Check className="h-4 w-4 relative z-10" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
