"use client"

import { type ChangeEvent, type DragEvent, useState } from "react"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface FileUploaderProps {
  onFileLoaded: (content: string, name: string) => void
  label: string
}

export function FileUploader({ onFileLoaded, label }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    setIsLoading(true)
    setFileName(file.name)

    try {
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Use FileReader to read file content
      const reader = new FileReader()

      reader.onload = (event) => {
        const content = event.target?.result as string
        onFileLoaded(content, file.name)
        setIsLoading(false)
      }

      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "There was an error reading the file. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }

      reader.readAsText(file)
    } catch (error) {
      toast({
        title: "Error processing file",
        description: "There was an error processing the file. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={`p-6 border-2 border-dashed ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      } flex flex-col items-center justify-center text-center cursor-pointer transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
    >
      <input
        type="file"
        id={`file-upload-${label}`}
        className="hidden"
        onChange={handleFileChange}
        accept=".txt,.js,.jsx,.ts,.tsx,.html,.css,.json,.md,.py,.java,.c,.cpp,.h,.rb,.php,.sql"
      />

      <Upload className="h-10 w-10 text-muted-foreground mb-4" />

      <h3 className="text-lg font-medium mb-1">{label}</h3>

      {fileName ? (
        <p className="text-sm text-muted-foreground mb-2">{isLoading ? "Loading..." : fileName}</p>
      ) : (
        <p className="text-sm text-muted-foreground mb-2">Drag and drop a file here, or click to select</p>
      )}

      <Button variant="outline" size="sm" className="mt-2">
        Select File
      </Button>
    </Card>
  )
}
