
"use client"

import * as React from "react"
import { Header } from "@/components/Header"
import { EvaluationForm } from "@/components/EvaluationForm"
import { EvaluationResults } from "@/components/EvaluationResults"
import { EvaluationHistory } from "@/components/EvaluationHistory"
import { parseRubric } from "@/ai/flows/parse-rubric-flow"
import { evaluateAssignment } from "@/ai/flows/evaluate-assignment-flow"
import { useToast } from "@/hooks/use-toast"
import { BrainCircuit, History, FilePlus2, Sparkles, GraduationCap, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirebase, useFirestore, setDocumentNonBlocking } from "@/firebase"
import { doc } from "firebase/firestore"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const [results, setResults] = React.useState<any>(null)
  const [lastEvalId, setLastEvalId] = React.useState<string | undefined>(undefined)
  const [isEvaluating, setIsEvaluating] = React.useState(false)
  const [evaluationCount, setEvaluationCount] = React.useState({ current: 0, total: 0 })
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()
  const { user, isUserLoading, auth } = useFirebase()
  const db = useFirestore()

  React.useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth)
    }
  }, [user, isUserLoading, auth])

  const handleEvaluate = async (assignments: { text: string; fileName: string; fileUrl?: string }[], rubricText: string, language: 'English' | 'Hindi') => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Session initializing",
        description: "Please wait while we establish your secure workspace...",
      })
      return
    }

    setIsEvaluating(true)
    setResults(null)
    setLastEvalId(undefined)
    setError(null)
    setEvaluationCount({ current: 0, total: assignments.length })
    
    try {
      // Step 1: Parse Rubric
      const rubricResult = await parseRubric({ rubricText })
      
      if (rubricResult.error || !rubricResult.data) {
        throw new Error(rubricResult.error || "The rubric text could not be parsed.")
      }

      const rubricDescription = rubricResult.data
        .map(r => `${r.criterion}: ${r.max_marks} marks`)
        .join('\n')

      // Step 2: Loop through assignments (Bulk Support)
      for (let i = 0; i < assignments.length; i++) {
        setEvaluationCount(prev => ({ ...prev, current: i + 1 }))
        const { text: assignmentText, fileName, fileUrl } = assignments[i]

        const evalResult = await evaluateAssignment({
          assignmentText,
          rubricDescription,
          outputLanguage: language
        })

        if (evalResult.error || !evalResult.data) {
          throw new Error(evalResult.error || `Failed to evaluate assignment: ${fileName}`)
        }

        const evaluationData = evalResult.data
        const evaluationId = crypto.randomUUID()
        const evalRef = doc(db, 'users', user.uid, 'evaluations', evaluationId)
        
        const totalScore = evaluationData.evaluation.reduce((acc, curr) => acc + curr.score, 0)
        const totalMaxMarks = evaluationData.evaluation.reduce((acc, curr) => acc + curr.max_marks, 0)

        const evaluationDoc = {
          id: evaluationId,
          userId: user.uid,
          assignmentTitle: fileName || "Untitled Assignment",
          fileUrl: fileUrl || null,
          evaluationDateTime: new Date().toISOString(),
          overallSummary: evaluationData.overall_summary,
          integrityFlag: evaluationData.integrity_flag,
          totalScore,
          totalMaxMarks,
          selectedLanguage: language,
          rawResults: evaluationData,
          assignmentId: "manual-upload",
          rubricId: "custom-input",
          confidenceScore: 0.95
        }

        // Save evaluation
        setDocumentNonBlocking(evalRef, evaluationDoc, { merge: true })

        // Save criteria details
        for (const item of evaluationData.evaluation) {
          const critId = crypto.randomUUID()
          const critRef = doc(db, 'users', user.uid, 'evaluations', evaluationId, 'criterionEvaluations', critId)
          
          setDocumentNonBlocking(critRef, {
            id: critId,
            evaluationId,
            userId: user.uid,
            criterionName: item.criterion,
            maxMarks: item.max_marks,
            score: item.score,
            feedback: item.feedback,
            suggestions: item.suggestions,
            order: evaluationData.evaluation.indexOf(item)
          }, { merge: true })
        }

        // Update UI with the last result
        if (i === assignments.length - 1) {
          setResults(evaluationData)
          setLastEvalId(evaluationId)
        }
      }

      toast({
        title: assignments.length > 1 ? "Bulk Run Complete" : "Evaluation Successful",
        description: `Analyzed ${assignments.length} submission(s).`,
      })
      
      setTimeout(() => {
        document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)

    } catch (err: any) {
      console.error("Evaluation Loop Error:", err)
      setError(err.message || "An unexpected system error occurred.")
      toast({
        variant: "destructive",
        title: "Evaluation Failed",
        description: "An error occurred during the analysis process.",
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Intelligent Academic Grading
            </div>
            <h1 className="text-4xl font-black font-headline tracking-tight text-slate-900">Academic Workspace</h1>
            <p className="text-muted-foreground text-lg">Batch-process assignments with AI-driven criteria mapping.</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 bg-destructive/5 border-destructive/20 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Notice</AlertTitle>
            <AlertDescription>
              {error} This is usually due to missing configuration or an unsupported document format. 
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="evaluate" className="space-y-8">
          <TabsList className="bg-white border shadow-sm h-14 p-1 rounded-2xl">
            <TabsTrigger value="evaluate" className="gap-2 px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <FilePlus2 className="h-4 w-4" />
              New Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <History className="h-4 w-4" />
              Recent Evaluations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluate" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EvaluationForm onEvaluate={handleEvaluate} isLoading={isEvaluating} />

            {isEvaluating && (
              <div className="py-24 flex flex-col items-center justify-center gap-8 bg-white rounded-[2rem] border-2 border-dashed border-primary/20 shadow-xl shadow-primary/5">
                <div className="relative">
                  <div className="h-24 w-24 border-4 border-primary/10 border-t-primary animate-spin rounded-full" />
                  <BrainCircuit className="h-12 w-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black font-headline text-slate-900">Intelligent Analysis in Progress</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                    <p className="text-muted-foreground text-lg font-medium">
                      {evaluationCount.total > 1 
                        ? `Processing submission ${evaluationCount.current} of ${evaluationCount.total}` 
                        : "Generating feedback based on your custom rubric..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {results && !isEvaluating && (
              <div id="results-view" className="scroll-mt-24 pt-4">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="h-10 w-2 bg-primary rounded-full" />
                     <h2 className="text-3xl font-black font-headline text-slate-900">Latest Report</h2>
                   </div>
                </div>
                <EvaluationResults results={results} id={lastEvalId} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <EvaluationHistory />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t py-16 mt-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-headline font-black text-slate-900 text-2xl">RubricAI</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Powered by Genkit and Gemini for accurate, criteria-based academic grading.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
