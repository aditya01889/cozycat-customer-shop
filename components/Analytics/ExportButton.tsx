'use client'

import { useState } from 'react'
import { Download, FileText, Table } from 'lucide-react'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface ExportButtonProps {
  data: any[]
  filename: string
  title?: string
  type?: 'pdf' | 'excel' | 'csv' | 'all'
}

export default function ExportButton({ data, filename, title = "Report", type = 'all' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text(title, 20, 20)
      
      // Add timestamp
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
      
      // Add data table
      doc.setFontSize(12)
      let yPosition = 50
      
      if (data.length > 0) {
        // Headers
        const headers = Object.keys(data[0])
        headers.forEach((header, index) => {
          doc.text(header, 20 + (index * 40), yPosition)
        })
        
        yPosition += 10
        
        // Data rows
        data.slice(0, 20).forEach((row) => {
          headers.forEach((header, index) => {
            const value = row[header]?.toString() || ''
            doc.text(value.substring(0, 15), 20 + (index * 40), yPosition)
          })
          yPosition += 8
          
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
        })
      }
      
      doc.save(`${filename}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = () => {
    setIsExporting(true)
    try {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, title)
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = () => {
    setIsExporting(true)
    try {
      const ws = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(ws)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting to CSV:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (type === 'pdf') {
    return (
      <button
        onClick={exportToPDF}
        disabled={isExporting || data.length === 0}
        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FileText className="w-4 h-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </button>
    )
  }

  if (type === 'excel') {
    return (
      <button
        onClick={exportToExcel}
        disabled={isExporting || data.length === 0}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Table className="w-4 h-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export Excel'}
      </button>
    )
  }

  if (type === 'csv') {
    return (
      <button
        onClick={exportToCSV}
        disabled={isExporting || data.length === 0}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={exportToPDF}
        disabled={isExporting || data.length === 0}
        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        <FileText className="w-4 h-4 mr-1" />
        PDF
      </button>
      <button
        onClick={exportToExcel}
        disabled={isExporting || data.length === 0}
        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        <Table className="w-4 h-4 mr-1" />
        Excel
      </button>
      <button
        onClick={exportToCSV}
        disabled={isExporting || data.length === 0}
        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        <Download className="w-4 h-4 mr-1" />
        CSV
      </button>
    </div>
  )
}
