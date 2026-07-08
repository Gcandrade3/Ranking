function escapeCsvField(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (/[",\n;]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(';'))
  const csv = '﻿' + lines.join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
