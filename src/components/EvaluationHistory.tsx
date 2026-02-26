
"use client"

import * as React from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, Calendar, ShieldCheck, Info, AlertTriangle, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export function EvaluationHistory() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'users', user.uid, 'evaluations'),
      orderBy('evaluationDateTime', 'desc')
    )
  }, [db, user])

  const { data: history, isLoading } = useCollection(historyQuery)

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user || !db) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'evaluations', id))
      toast({
        title: "Evaluation Deleted",
        description: "The evaluation has been removed from your history.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the evaluation.",
      })
    }
  }

  const getIntegrityIcon = (flag: string) => {
    switch (flag) {
      case 'low risk': return <ShieldCheck className="h-4 w-4 text-green-500" />
      case 'moderate risk': return <Info className="h-4 w-4 text-yellow-500" />
      case 'needs review': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <Card className="border-dashed py-20 bg-white">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="p-4 bg-muted rounded-full">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold">No history yet</h3>
            <p className="text-muted-foreground">Start evaluating assignments to see them here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm overflow-hidden border-none">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold pl-8">Assignment</TableHead>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold text-center">Score</TableHead>
            <TableHead className="font-bold">Originality</TableHead>
            <TableHead className="text-right font-bold pr-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item: any) => (
            <TableRow 
              key={item.id} 
              className="group cursor-pointer hover:bg-primary/[0.02] transition-colors"
              onClick={() => router.push(`/evaluation/${item.id}`)}
            >
              <TableCell className="font-medium pl-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-slate-900">{item.assignmentTitle}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(item.evaluationDateTime), "MMM d, h:mm a")}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-black text-xs px-3 py-1 bg-primary/10 text-primary border-none">
                  {item.totalScore}/{item.totalMaxMarks}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 capitalize text-xs font-bold">
                  {getIntegrityIcon(item.integrityFlag)}
                  {item.integrityFlag}
                </div>
              </TableCell>
              <TableCell className="text-right pr-8">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(e, item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
