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
      
      // Set up the document
      doc.setFontSize(20)
      doc.setTextColor(249, 115, 22) // Orange color
      doc.text(title, 20, 20)
      
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 20, 30)
      
      // Add a line separator
      doc.setDrawColor(249, 115, 22)
      doc.setLineWidth(0.5)
      doc.line(20, 35, 190, 35)
      
      // Group data by type
      const monthlyData = data.filter(item => item.Month)
      const productData = data.filter(item => item.Product)
      const statusData = data.filter(item => item.Status)
      const segmentData = data.filter(item => item['Customer Segment'])
      
      let yPosition = 50
      
      // Monthly Revenue Section
      if (monthlyData.length > 0) {
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Monthly Revenue', 20, yPosition)
        yPosition += 10
        
        // Table headers
        doc.setFontSize(10)
        doc.setFillColor(249, 115, 22)
        doc.setTextColor(255, 255, 255)
        doc.rect(20, yPosition, 170, 8, 'F')
        doc.text('Month', 25, yPosition + 5)
        doc.text('Revenue', 80, yPosition + 5)
        doc.text('Orders', 130, yPosition + 5)
        yPosition += 15
        
        // Data rows
        doc.setTextColor(60, 60, 60)
        monthlyData.forEach((item, index) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          
          if (index % 2 === 0) {
            doc.setFillColor(249, 249, 249)
            doc.rect(20, yPosition - 3, 170, 8, 'F')
          }
          
          doc.text(item.Month || '', 25, yPosition)
          doc.text(`₹${(item.Revenue || 0).toLocaleString('en-IN')}`, 80, yPosition)
          doc.text((item.Orders || 0).toString(), 130, yPosition)
          yPosition += 10
        })
        yPosition += 10
      }
      
      // Product Performance Section
      if (productData.length > 0) {
        if (yPosition > 240) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Product Performance', 20, yPosition)
        yPosition += 10
        
        // Table headers
        doc.setFontSize(10)
        doc.setFillColor(249, 115, 22)
        doc.setTextColor(255, 255, 255)
        doc.rect(20, yPosition, 170, 8, 'F')
        doc.text('Product', 25, yPosition + 5)
        doc.text('Units Sold', 100, yPosition + 5)
        doc.text('Revenue', 150, yPosition + 5)
        yPosition += 15
        
        // Data rows
        doc.setTextColor(60, 60, 60)
        productData.forEach((item, index) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          
          if (index % 2 === 0) {
            doc.setFillColor(249, 249, 249)
            doc.rect(20, yPosition - 3, 170, 8, 'F')
          }
          
          doc.text((item.Product || '').substring(0, 25), 25, yPosition)
          doc.text((item['Total Sold'] || 0).toString(), 100, yPosition)
          doc.text(`₹${(item.Revenue || 0).toLocaleString('en-IN')}`, 150, yPosition)
          yPosition += 10
        })
        yPosition += 10
      }
      
      // Order Status Section
      if (statusData.length > 0) {
        if (yPosition > 240) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Order Status Breakdown', 20, yPosition)
        yPosition += 10
        
        // Table headers
        doc.setFontSize(10)
        doc.setFillColor(249, 115, 22)
        doc.setTextColor(255, 255, 255)
        doc.rect(20, yPosition, 170, 8, 'F')
        doc.text('Status', 25, yPosition + 5)
        doc.text('Count', 100, yPosition + 5)
        yPosition += 15
        
        // Data rows
        doc.setTextColor(60, 60, 60)
        statusData.forEach((item, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(249, 249, 249)
            doc.rect(20, yPosition - 3, 170, 8, 'F')
          }
          
          doc.text((item.Status || '').replace('_', ' '), 25, yPosition)
          doc.text((item.Count || 0).toString(), 100, yPosition)
          yPosition += 10
        })
        yPosition += 10
      }
      
      // Customer Segments Section
      if (segmentData.length > 0) {
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Customer Segments', 20, yPosition)
        yPosition += 10
        
        // Table headers
        doc.setFontSize(10)
        doc.setFillColor(249, 115, 22)
        doc.setTextColor(255, 255, 255)
        doc.rect(20, yPosition, 170, 8, 'F')
        doc.text('Segment', 25, yPosition + 5)
        doc.text('Count', 80, yPosition + 5)
        doc.text('Revenue', 120, yPosition + 5)
        doc.text('Percentage', 160, yPosition + 5)
        yPosition += 15
        
        // Data rows
        doc.setTextColor(60, 60, 60)
        segmentData.forEach((item, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(249, 249, 249)
            doc.rect(20, yPosition - 3, 170, 8, 'F')
          }
          
          doc.text((item['Customer Segment'] || '').substring(0, 20), 25, yPosition)
          doc.text((item.Count || 0).toString(), 80, yPosition)
          doc.text(`₹${(item.Revenue || 0).toLocaleString('en-IN')}`, 120, yPosition)
          doc.text((item.Percentage || 0).toString() + '%', 160, yPosition)
          yPosition += 10
        })
      }
      
      // Add footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('CozyCatKitchen Analytics Dashboard', 20, 285)
      doc.text('Page 1', 190, 285)
      
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
