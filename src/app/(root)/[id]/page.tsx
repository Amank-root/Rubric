"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { EvaluationResults } from "@/components/EvaluationResults"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ChevronLeft, FileText, Calendar, Clock, ArrowLeft, Globe } from "lucide-react"
import { format, isValid } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function EvaluationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()

  const docRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null
    return doc(db, 'users', user.uid, 'evaluations', id as string)
  }, [db, user, id])

  const { data: evaluation, isLoading } = useDoc(docRef)

  const formattedDateTime = React.useMemo(() => {
    if (!evaluation?.evaluationDateTime) return { date: "Unknown Date", time: "" };
    const date = new Date(evaluation.evaluationDateTime);
    if (!isValid(date)) return { date: "Invalid Date", time: "" };
    
    return {
      date: format(date, "MMMM d, yyyy"),
      time: format(date, "h:mm a")
    };
  }, [evaluation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
           <Skeleton className="h-8 w-40" />
           <Skeleton className="h-32 w-full rounded-2xl" />
           <Skeleton className="h-[600px] w-full rounded-2xl" />
        </main>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center space-y-6">
           <div className="p-4 bg-muted w-20 h-20 rounded-full mx-auto flex items-center justify-center">
             <FileText className="h-10 w-10 text-muted-foreground" />
           </div>
           <h1 className="text-2xl font-bold">Report Not Found</h1>
           <p className="text-muted-foreground">This evaluation report might have been deleted or is inaccessible.</p>
           <Button onClick={() => router.push("/")} className="gap-2">
             <ArrowLeft className="h-4 w-4" />
             Back to Workspace
           </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
           <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 -ml-2 text-muted-foreground hover:text-primary gap-2"
           >
             <ChevronLeft className="h-4 w-4" />
             Back
           </Button>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-primary/10 rounded-2xl">
                   <FileText className="h-8 w-8 text-primary" />
                 </div>
                 <div>
                   <h1 className="text-3xl font-black font-headline tracking-tight break-all">{evaluation.assignmentTitle}</h1>
                   <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                     <span className="flex items-center gap-1.5 font-medium">
                       <Calendar className="h-4 w-4" />
                       {formattedDateTime.date}
                     </span>
                     {formattedDateTime.time && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="h-4 w-4" />
                          {formattedDateTime.time}
                        </span>
                     )}
                   </div>
                 </div>
               </div>
             </div>

             {evaluation.fileUrl && (
               <Button 
                variant="outline" 
                className="gap-2 border-primary/20 text-primary font-bold bg-primary/5"
                onClick={() => window.open(evaluation.fileUrl, '_blank')}
               >
                 <Globe className="h-4 w-4" />
                 Source Document
               </Button>
             )}
           </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <EvaluationResults results={evaluation.rawResults} title={evaluation.assignmentTitle} id={evaluation.id} fileUrl={evaluation.fileUrl} />
      </main>
    </div>
  )
}
