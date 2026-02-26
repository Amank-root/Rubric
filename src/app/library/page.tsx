
"use client"

import * as React from "react"
import { Header } from "@/components/Header"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ShieldCheck, Info, AlertTriangle, ChevronRight, BookOpen, GraduationCap } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export default function LibraryPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'users', user.uid, 'evaluations'),
      orderBy('evaluationDateTime', 'desc')
    )
  }, [db, user])

  const { data: library, isLoading } = useCollection(historyQuery)

  const getIntegrityIcon = (flag: string) => {
    switch (flag) {
      case 'low risk': return <ShieldCheck className="h-4 w-4 text-green-500" />
      case 'moderate risk': return <Info className="h-4 w-4 text-yellow-500" />
      case 'needs review': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/10">
              <BookOpen className="h-3.5 w-3.5" />
              Evaluation Library
            </div>
            <h1 className="text-4xl font-black font-headline tracking-tight text-slate-900">Your Archive</h1>
            <p className="text-muted-foreground text-lg">Browse and manage your historical academic evaluations.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : !library || library.length === 0 ? (
          <Card className="border-dashed py-32 bg-white flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-muted rounded-full mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Library Empty</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              You haven't performed any evaluations yet. Start a new analysis from the workspace.
            </p>
            <Button onClick={() => router.push("/")} size="lg" className="font-bold">
              Go to Workspace
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {library.map((item: any) => (
              <Card 
                key={item.id} 
                className="group hover:border-primary/50 transition-all cursor-pointer bg-white shadow-sm overflow-hidden flex flex-col"
                onClick={() => router.push(`/evaluation/${item.id}`)}
              >
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="font-black bg-primary/10 text-primary border-none">
                      {item.totalScore}/{item.totalMaxMarks}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mt-4 line-clamp-1 group-hover:text-primary transition-colors">
                    {item.assignmentTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex-grow flex flex-col gap-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(item.evaluationDateTime), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 capitalize">
                      {getIntegrityIcon(item.integrityFlag)}
                      {item.integrityFlag}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {item.selectedLanguage || "English"}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto font-bold text-primary">
                      View Report
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
              Advanced AI workspace for academic grading, feedback, and integrity monitoring.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
