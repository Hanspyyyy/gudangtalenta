'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, MoreVertical, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/lib/actions/master-data'

export type FieldDef =
  | {
      name: string
      label: string
      type: 'text'
      required?: boolean
      placeholder?: string
    }
  | {
      name: string
      label: string
      type: 'select'
      required?: boolean
      placeholder?: string
      options: { value: string; label: string }[]
    }

export type ManagerItem = {
  id: string
  is_active: boolean
  primary: string
  secondary?: string | null
  values: Record<string, string>
}

export function MasterDataManager({
  entityLabel,
  fields,
  items,
  emptyLabel,
  onSubmit,
  onToggle,
}: {
  entityLabel: string
  fields: FieldDef[]
  items: ManagerItem[]
  emptyLabel: string
  onSubmit: (
    values: Record<string, string>,
    editingId?: string,
  ) => Promise<ActionResult>
  onToggle: (id: string, isActive: boolean) => Promise<ActionResult>
}) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const openCreate = () => {
    setEditingId(undefined)
    setValues({})
    setError(null)
    setOpen(true)
  }

  const openEdit = (item: ManagerItem) => {
    setEditingId(item.id)
    setValues({ ...item.values })
    setError(null)
    setOpen(true)
  }

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await onSubmit(values, editingId)
      if (res.ok) {
        toast.success(editingId ? `${entityLabel} diperbarui` : `${entityLabel} ditambahkan`)
        setOpen(false)
      } else {
        setError(res.error ?? 'Gagal menyimpan data.')
      }
    })
  }

  const toggle = (item: ManagerItem) => {
    startTransition(async () => {
      const res = await onToggle(item.id, !item.is_active)
      if (res.ok) {
        toast.success(
          item.is_active
            ? `${entityLabel} dinonaktifkan`
            : `${entityLabel} diaktifkan`,
        )
      } else {
        toast.error(res.error ?? 'Gagal memperbarui status.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <Button onClick={openCreate} className="h-11 w-full">
        <Plus className="size-4" aria-hidden="true" />
        Tambah {entityLabel}
      </Button>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-12 text-center">
          <p className="text-sm font-medium">Belum ada data</p>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            {emptyLabel}
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                i !== 0 && 'border-t border-border',
                !item.is_active && 'opacity-55',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{item.primary}</p>
                  {!item.is_active && (
                    <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Nonaktif
                    </span>
                  )}
                </div>
                {item.secondary && (
                  <p className="truncate text-sm text-muted-foreground">
                    {item.secondary}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    aria-label={`Aksi untuk ${item.primary}`}
                    disabled={isPending}
                  >
                    <MoreVertical className="size-4.5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(item)}>
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggle(item)}>
                    {item.is_active ? (
                      <>
                        <EyeOff className="size-4" aria-hidden="true" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <Eye className="size-4" aria-hidden="true" />
                        Aktifkan
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? `Edit ${entityLabel}` : `Tambah ${entityLabel}`}
            </DialogTitle>
            <DialogDescription>
              Lengkapi informasi {entityLabel.toLowerCase()} di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-1">
            {fields.map((field) => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                {field.type === 'text' ? (
                  <Input
                    id={field.name}
                    value={values[field.name] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                    className="h-11"
                  />
                ) : (
                  <Select
                    value={values[field.name] ?? ''}
                    onValueChange={(val) =>
                      setValues((v) => ({ ...v, [field.name]: val }))
                    }
                  >
                    <SelectTrigger id={field.name} className="h-11">
                      <SelectValue placeholder={field.placeholder ?? 'Pilih...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
