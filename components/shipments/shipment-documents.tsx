"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Eye,
  Upload,
  Search,
  File,
  FileIcon as FilePdf,
  FileImage,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface ShipmentDocumentsProps {
  shipment: any
}

export function ShipmentDocuments({ shipment }: ShipmentDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  if (!shipment || !shipment.documents) {
    return <div>No documents available</div>
  }

  const filteredDocuments = shipment.documents.filter((doc: any) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDownload = (doc: any) => {
    toast({
      title: "Document download started",
      description: `Downloading ${doc.name}...`,
    })
    // In a real app, this would trigger the download
  }

  const handleView = (doc: any) => {
    toast({
      title: "Opening document viewer",
      description: `Viewing ${doc.name}...`,
    })
    // In a real app, this would open a document viewer
  }

  const handleUpload = () => {
    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      })
    }, 2000)
  }

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FilePdf className="h-6 w-6 text-red-500" />
      case "jpg":
      case "png":
      case "image":
        return <FileImage className="h-6 w-6 text-blue-500" />
      case "xlsx":
      case "csv":
      case "spreadsheet":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search documents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-medium">No documents found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `No documents matching "${searchQuery}"`
              : "There are no documents associated with this shipment"}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc: any, index: number) => (
            <div key={index} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                {getDocumentIcon(doc.type)}
                <div>
                  <h4 className="font-medium">{doc.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{doc.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleView(doc)}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-sm font-medium">Required Documents</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Bill of Lading</span>
            </div>
            <Badge variant="outline" className="text-green-500">
              Uploaded
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Commercial Invoice</span>
            </div>
            <Badge variant="outline" className="text-green-500">
              Uploaded
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Packing List</span>
            </div>
            <Badge variant="outline" className="text-green-500">
              Uploaded
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Proof of Delivery</span>
            </div>
            <Badge variant="outline" className="text-yellow-500">
              Pending
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
