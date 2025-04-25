"use client"

import { useRef, useState } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { Loader2 } from "lucide-react"

interface MonacoEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  language?: string
  height?: string
  readOnly?: boolean
}

export function MonacoEditor({
  value,
  onChange,
  language = "plaintext",
  height = "300px",
  readOnly = false,
}: MonacoEditorProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const monacoRef = useRef<Monaco | null>(null)

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    setIsLoaded(true)
    monacoRef.current = monaco

    // Configure editor
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly,
      wordWrap: "on",
    })
  }

  return (
    <div className="relative border rounded-md overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          readOnly,
          wordWrap: "on",
        }}
        loading={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
      />
    </div>
  )
}
