"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import * as DiffMatchPatch from "diff-match-patch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "./file-uploader";
import { MonacoEditor } from "./monaco-editor";

export default function FileDiffPage() {
  const [file1Content, setFile1Content] = useState<string>("");
  const [file2Content, setFile2Content] = useState<string>("");
  const [file1Name, setFile1Name] = useState<string>("");
  const [file2Name, setFile2Name] = useState<string>("");
  const [diffView, setDiffView] = useState<"split" | "unified">("split");
  const [diffResult, setDiffResult] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Debounced diff calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (file1Content && file2Content) {
        calculateDiff();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [file1Content, file2Content]);

  const calculateDiff = () => {
    setIsProcessing(true);

    // Use a setTimeout to prevent UI blocking for large files
    setTimeout(() => {
      try {
        const dmp = new DiffMatchPatch.diff_match_patch();
        const diff = dmp.diff_main(file1Content, file2Content);
        dmp.diff_cleanupSemantic(diff);
        setDiffResult(diff);
      } catch (error) {
        toast({
          title: "Error calculating diff",
          description:
            "There was an error comparing the files. Please try again with smaller files.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  };

  const handleFile1Upload = (content: string, name: string) => {
    setFile1Content(content);
    setFile1Name(name);
  };

  const handleFile2Upload = (content: string, name: string) => {
    setFile2Content(content);
    setFile2Name(name);
  };

  const toggleDiffView = () => {
    setDiffView(diffView === "split" ? "unified" : "split");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">File Diff Tool</h1>
        <p className="text-muted-foreground">
          Upload two text files to see the differences between them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploader onFileLoaded={handleFile1Upload} label="First File" />
        <FileUploader onFileLoaded={handleFile2Upload} label="Second File" />
      </div>

      {(file1Content || file2Content) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={diffView === "unified"}
              onPressedChange={toggleDiffView}
              aria-label="Toggle diff view"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              {diffView === "split"
                ? "Switch to Unified View"
                : "Switch to Split View"}
            </Toggle>
          </div>
          <div className="text-sm text-muted-foreground">
            {isProcessing ? "Processing..." : ""}
          </div>
        </div>
      )}

      {file1Content && file2Content && (
        <Tabs defaultValue="diff" className="w-full">
          <TabsList>
            <TabsTrigger value="diff">Diff View</TabsTrigger>
            <TabsTrigger value="original">Original Files</TabsTrigger>
          </TabsList>
          <TabsContent value="diff" className="mt-4">
            <DiffViewer
              diffResult={diffResult}
              viewMode={diffView}
              file1Name={file1Name}
              file2Name={file2Name}
              isProcessing={isProcessing}
            />
          </TabsContent>
          <TabsContent value="original" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-medium mb-2">{file1Name || "File 1"}</h3>
                <MonacoEditor
                  value={file1Content}
                  onChange={(value) => setFile1Content(value || "")}
                  language="plaintext"
                  height="400px"
                />
              </Card>
              <Card className="p-4">
                <h3 className="font-medium mb-2">{file2Name || "File 2"}</h3>
                <MonacoEditor
                  value={file2Content}
                  onChange={(value) => setFile2Content(value || "")}
                  language="plaintext"
                  height="400px"
                />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface DiffViewerProps {
  diffResult: any[];
  viewMode: "split" | "unified";
  file1Name: string;
  file2Name: string;
  isProcessing: boolean;
}

function DiffViewer({
  diffResult,
  viewMode,
  file1Name,
  file2Name,
  isProcessing,
}: DiffViewerProps) {
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg">
        <p className="text-muted-foreground">Calculating differences...</p>
      </div>
    );
  }

  if (diffResult.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg">
        <p className="text-muted-foreground">
          No differences found or still processing...
        </p>
      </div>
    );
  }

  if (viewMode === "unified") {
    return <UnifiedDiffView diffResult={diffResult} />;
  }

  return (
    <SplitDiffView
      diffResult={diffResult}
      file1Name={file1Name}
      file2Name={file2Name}
    />
  );
}

function UnifiedDiffView({ diffResult }: { diffResult: any[] }) {
  return (
    <Card className="p-4 overflow-auto">
      <pre className="text-sm font-mono whitespace-pre-wrap">
        {diffResult.map((part, index) => {
          const [type, text] = part;
          const className =
            type === -1
              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              : type === 1
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              : "";

          return (
            <span key={index} className={className}>
              {text}
            </span>
          );
        })}
      </pre>
    </Card>
  );
}

function SplitDiffView({
  diffResult,
  file1Name,
  file2Name,
}: {
  diffResult: any[];
  file1Name: string;
  file2Name: string;
}) {
  // Process diff result into left and right content
  const left: { text: string; type: number }[] = [];
  const right: { text: string; type: number }[] = [];

  diffResult.forEach(([type, text]) => {
    if (type === -1) {
      // Removed from file1
      left.push({ text, type });
    } else if (type === 1) {
      // Added in file2
      right.push({ text, type });
    } else {
      // Unchanged
      left.push({ text, type });
      right.push({ text, type });
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4 overflow-auto">
        <h3 className="font-medium mb-2">{file1Name || "File 1"}</h3>
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {left.map((part, index) => {
            const className =
              part.type === -1
                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                : "";

            return (
              <span key={index} className={className}>
                {part.text}
              </span>
            );
          })}
        </pre>
      </Card>
      <Card className="p-4 overflow-auto">
        <h3 className="font-medium mb-2">{file2Name || "File 2"}</h3>
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {right.map((part, index) => {
            const className =
              part.type === 1
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : "";

            return (
              <span key={index} className={className}>
                {part.text}
              </span>
            );
          })}
        </pre>
      </Card>
    </div>
  );
}
