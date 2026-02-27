"use client"

import * as React from "react"
import { Upload, FileText, Languages, Search, Send, Trash2, FileCheck, Info, Files, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { extractTextFromFile } from "@/lib/file-parser"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface FileEntry {
  id: string
  name: string
  text: string
  fileUrl?: string
  status: 'processing' | 'ready' | 'error'
}

interface EvaluationFormProps {
  onEvaluate: (assignments: { text: string; fileName: string; fileUrl?: string }[], rubric: string, language: 'English' | 'Hindi') => void
  isLoading: boolean
}

export function EvaluationForm({ onEvaluate, isLoading }: EvaluationFormProps) {
  const [pastedAssignment, setPastedAssignment] = React.useState("")
  const [rubric, setRubric] = React.useState("")
  const [language, setLanguage] = React.useState<'English' | 'Hindi'>('English')
  const [files, setFiles] = React.useState<FileEntry[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submissions: { text: string; fileName: string; fileUrl?: string }[] = []
    
    if (pastedAssignment.trim()) {
      submissions.push({ text: pastedAssignment, fileName: "Pasted Submission" })
    }
    
    files.filter(f => f.status === 'ready').forEach(f => {
      submissions.push({ text: f.text, fileName: f.name, fileUrl: f.fileUrl })
    })

    if (submissions.length === 0 || !rubric) return
    onEvaluate(submissions, rubric, language)
  }

  const handleRubricTemplate = () => {
    setRubric("Content (10 marks)\nStructure (5 marks)\nReferences (5 marks)")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    const newEntries: FileEntry[] = selectedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      text: "",
      status: 'processing'
    }))

    setFiles(prev => [...prev, ...newEntries])

    for (const file of selectedFiles) {
      try {
        // Step 1: Extract text locally for analysis
        const text = await extractTextFromFile(file)
        
        // Step 2: Upload to Cloudinary for storage
        const fileUrl = await uploadToCloudinary(file)

        setFiles(prev => prev.map(entry => 
          entry.name === file.name ? { ...entry, text, fileUrl, status: 'ready' } : entry
        ))
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `Error processing ${file.name}: ${err.message}`,
        })
        setFiles(prev => prev.map(entry => 
          entry.name === file.name ? { ...entry, status: 'error' } : entry
        ))
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const isProcessingFiles = files.some(f => f.status === 'processing')
  const hasSubmissions = pastedAssignment.trim().length > 0 || files.some(f => f.status === 'ready')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md border-transparent hover:border-primary/20 transition-all bg-white overflow-hidden flex flex-col min-h-[500px]">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2 text-lg">
                <Files className="h-5 w-5 text-primary" />
                Student Submissions
              </CardTitle>
              <Badge variant="outline" className="bg-white">
                {files.length > 0 ? `${files.length} FILE(S)` : "REQUIRED"}
              </Badge>
            </div>
            <CardDescription>Upload files to Cloudinary for storage and AI analysis.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col">
            <div className="p-4 bg-muted/10 border-b flex flex-col gap-3">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload} 
                accept=".pdf,.docx,.txt" 
                multiple
                className="hidden" 
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 border-dashed border-2 py-6 bg-white flex-wrap text-center h-auto text-wrap"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
                Upload & Store on Cloudinary (PDF, DOCX, TXT)
              </Button>

              {files.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file) => (
                    <div key={file.id} className={cn(
                      "flex items-center justify-between p-2 rounded-lg border transition-colors",
                      file.status === 'ready' ? "bg-green-50/50 border-green-100" : "bg-primary/5 border-primary/20"
                    )}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        {file.status === 'processing' ? (
                          <div className="h-3 w-3 border-2 border-primary border-t-transparent animate-spin rounded-full shrink-0" />
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <FileCheck className={cn("h-4 w-4", file.status === 'ready' ? "text-green-600" : "text-primary")} />
                            {file.fileUrl && <Globe className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        )}
                        <span className="text-xs font-medium truncate">{file.name}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive/10" 
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex-grow relative">
              <div className="absolute top-2 left-4 z-10">
                <span className="text-[10px] font-bold text-muted-foreground bg-white px-2 rounded-full border">OR PASTE TEXT</span>
              </div>
              <Textarea
                placeholder="Paste an assignment content here to evaluate a single submission..."
                className="h-full min-h-[250px] border-none focus-visible:ring-0 rounded-none resize-none p-4 pt-8"
                value={pastedAssignment}
                onChange={(e) => setPastedAssignment(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-transparent hover:border-primary/20 transition-all bg-white overflow-hidden flex flex-col min-h-[500px]">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                Grading Rubric
              </CardTitle>
              <Badge variant="outline" className="bg-white">REQUIRED</Badge>
            </div>
            <CardDescription>Define criteria and maximum marks.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col">
            <div className="p-4 bg-muted/10 border-b flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                Format: Criterion (X marks)
              </div>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-[10px]" onClick={handleRubricTemplate}>
                Load Example
              </Button>
            </div>
            <Textarea
              placeholder="e.g., Grammar (5 marks)..."
              className="flex-grow min-h-[300px] border-none focus-visible:ring-0 rounded-none resize-none p-4"
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              required
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-lg border-2 border-primary/5 gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              <Languages className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="language" className="text-sm font-bold">Feedback Language</Label>
              <p className="text-xs text-muted-foreground">Language for AI suggestions</p>
            </div>
          </div>
          <Select 
            value={language} 
            onValueChange={(val) => setLanguage(val as 'English' | 'Hindi')}
          >
            <SelectTrigger className="w-full md:w-[180px] h-11">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English (Recommended)</SelectItem>
              <SelectItem value="Hindi">Hindi (Regional)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading || !hasSubmissions || !rubric || isProcessingFiles}
          className="w-full md:w-auto h-12 px-10 gap-2 shadow-primary/20 shadow-xl hover:translate-y-[-2px] transition-all active:translate-y-[0px]"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              Processing Bulk...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {files.length > 1 ? `Evaluate ${files.length} Submissions` : "Evaluate Submission"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
