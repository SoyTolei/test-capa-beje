"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface PDFViewerProps {
  url: string
  title: string
}

export function PDFViewer({ url, title }: PDFViewerProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = url
    link.download = title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-[8.5/11] border rounded-lg overflow-hidden bg-muted">
          <iframe src={url} className="w-full h-full" title={title} />
        </div>
      </CardContent>
    </Card>
  )
}
