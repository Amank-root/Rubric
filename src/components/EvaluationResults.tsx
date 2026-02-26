"use client"

import * as React from "react"
import { CheckCircle2, AlertTriangle, ShieldCheck, Info, MessageSquare, Lightbulb, FileDown, Share2, Globe, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EvaluateAssignmentOutput } from "@/ai/flows/evaluate-assignment-flow"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface EvaluationResultsProps {
  results: EvaluateAssignmentOutput
  title?: string
  id?: string // The evaluation document ID from Firestore
  fileUrl?: string // Cloudinary file URL
}

export function EvaluationResults({ results, title, id, fileUrl }: EvaluationResultsProps) {
  const { toast } = useToast()
  
  const totalScore = React.useMemo(() => 
    results.evaluation.reduce((acc, curr) => acc + curr.score, 0), 
  [results.evaluation])

  const totalMaxMarks = React.useMemo(() => 
    results.evaluation.reduce((acc, curr) => acc + curr.max_marks, 0), 
  [results.evaluation])

  const percentage = React.useMemo(() => 
    totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0, 
  [totalScore, totalMaxMarks])

  const integrityColors = {
    'low risk': 'bg-green-50 text-green-700 border-green-100',
    'moderate risk': 'bg-yellow-50 text-yellow-700 border-yellow-100',
    'needs review': 'bg-red-50 text-red-700 border-red-100',
  }

  const integrityIcons = {
    'low risk': <ShieldCheck className="h-5 w-5 text-green-600" />,
    'moderate risk': <Info className="h-5 w-5 text-yellow-600" />,
    'needs review': <AlertTriangle className="h-5 w-5 text-red-600" />,
  }

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2))
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", `evaluation_${title?.replace(/\s+/g, '_') || 'report'}.json`)
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
      toast({
        title: "Report Exported",
        description: "Evaluation data has been downloaded as JSON.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate the export file.",
      })
    }
  }

  const handleShare = async () => {
    try {
      const shareUrl = id 
        ? `${window.location.origin}/evaluation/${id}` 
        : window.location.href

      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied",
        description: "Permanent report link copied to clipboard.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Share Failed",
        description: "Could not copy link to clipboard.",
      })
    }
  }

  return (
    <div className="space-y-8 animate-scoring">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-none bg-white">
          <CardContent className="pt-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="space-y-2">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Overall Grade</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black text-primary tracking-tighter">{totalScore}</span>
                  <span className="text-2xl text-muted-foreground font-medium">/ {totalMaxMarks}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 {fileUrl && (
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 h-10 border-primary/20 text-primary font-bold bg-primary/5"
                    onClick={() => window.open(fileUrl, '_blank')}
                   >
                     <Globe className="h-4 w-4" />
                     View Original File
                     <ExternalLink className="h-3 w-3" />
                   </Button>
                 )}
                 <div className="relative h-24 w-24">
                   <svg className="h-full w-full" viewBox="0 0 36 36">
                     <path className="text-muted/20" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-primary" stroke="currentColor" strokeWidth="3" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-xl font-black">{percentage}%</span>
                   </div>
                 </div>
              </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between text-sm font-bold">
                 <span>Performance Index</span>
                 <span className={cn(percentage > 70 ? "text-green-600" : "text-yellow-600")}>
                   {percentage > 90 ? 'Exceptional' : percentage > 70 ? 'Very Good' : percentage > 50 ? 'Developing' : 'Needs Improvement'}
                 </span>
               </div>
               <Progress value={percentage} className="h-4 bg-primary/10" />
            </div>

            <div className="mt-8 bg-muted/30 p-5 rounded-2xl border border-muted flex gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">AI Summary</p>
                <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                  {results.overall_summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-none bg-white overflow-hidden">
            <CardHeader className="pb-4 bg-muted/20">
              <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Originality Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className={cn("p-5 rounded-2xl border-2 flex flex-col gap-3 transition-colors", integrityColors[results.integrity_flag])}>
                <div className="flex items-center gap-3">
                  {integrityIcons[results.integrity_flag]}
                  <span className="font-black capitalize text-lg">{results.integrity_flag}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">
                  {results.integrity_flag === 'low risk' 
                    ? 'Text patterns are consistent with human authorship. Minimal generic phrasing detected.'
                    : results.integrity_flag === 'moderate risk'
                    ? 'Some repetitive structures identified. Consider reviewing for unique insights.'
                    : 'Highly formulaic language detected. Manual academic integrity check recommended.'}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                <Info className="h-3 w-3" />
                This is a pattern indicator, not a definitive detection.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 gap-2 font-bold shadow-sm" onClick={handleExport}>
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="h-12 gap-2 font-bold shadow-sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <Card className="shadow-md border-none bg-white">
        <CardHeader className="border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="font-headline text-2xl font-black flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7 text-primary" />
                Criterion Breakdown
              </CardTitle>
              <CardDescription className="text-sm">Detailed analysis of your performance across each rubric item.</CardDescription>
            </div>
            <Badge className="bg-primary/5 text-primary border-primary/10 text-xs px-3 py-1 font-bold">
              {results.evaluation.length} CRITERIA EVALUATED
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[240px] font-black uppercase text-[10px] tracking-widest pl-8">Evaluation Area</TableHead>
                  <TableHead className="w-[120px] text-center font-black uppercase text-[10px] tracking-widest">Score</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Feedback & Growth Steps</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.evaluation.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-primary/[0.02] transition-colors border-b last:border-0">
                    <TableCell className="font-bold align-top pt-8 pl-8 text-lg">
                      {item.criterion}
                    </TableCell>
                    <TableCell className="text-center align-top pt-8">
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="secondary" className="text-base px-4 py-1.5 font-black bg-primary/10 text-primary border-none">
                          {item.score} <span className="text-[10px] opacity-40 mx-1">/</span> {item.max_marks}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Points</span>
                      </div>
                    </TableCell>
                    <TableCell className="pt-8 pr-8 pb-8">
                      <div className="space-y-6">
                        <div className="relative pl-4 border-l-2 border-primary/20">
                          <p className="text-base leading-relaxed text-foreground/80">{item.feedback}</p>
                        </div>
                        <div className="bg-secondary/10 p-5 rounded-2xl border-2 border-secondary/20 shadow-inner">
                          <div className="flex items-center gap-2 text-secondary-foreground font-black text-xs uppercase tracking-widest mb-3">
                            <Lightbulb className="h-4 w-4" />
                            Improvement Strategy
                          </div>
                          <p className="text-sm font-medium leading-relaxed italic text-foreground/70">
                            {item.suggestions}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-0">
            <Accordion type="single" collapsible className="w-full">
              {results.evaluation.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-b last:border-0 px-4">
                  <AccordionTrigger className="hover:no-underline py-6">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-black text-left text-lg">{item.criterion}</span>
                      <Badge variant="secondary" className="font-black px-3 py-1 bg-primary/10 text-primary border-none">
                        {item.score}/{item.max_marks}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 px-2">
                    <div className="space-y-6">
                      <div className="bg-muted/40 p-5 rounded-2xl">
                        <p className="text-[10px] font-black text-muted-foreground mb-3 uppercase tracking-widest">DETAILED FEEDBACK</p>
                        <p className="text-base leading-relaxed">{item.feedback}</p>
                      </div>
                      <div className="bg-secondary/10 p-5 rounded-2xl border-2 border-secondary/20">
                        <p className="text-[10px] font-black text-secondary-foreground mb-3 uppercase tracking-widest">GROWTH STEPS</p>
                        <p className="text-sm font-medium italic leading-relaxed">{item.suggestions}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center pb-12 pt-4">
        <div className="bg-primary text-primary-foreground px-8 py-4 rounded-3xl shadow-2xl shadow-primary/30 flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="bg-white/20 p-2 rounded-full">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-widest">Goal Achieved?</span>
            <span className="text-xs font-medium opacity-80">Use these insights for your final submission.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
