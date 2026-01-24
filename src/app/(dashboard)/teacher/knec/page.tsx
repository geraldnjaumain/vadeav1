"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookOpenIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Id } from "../../../../../convex/_generated/dataModel";

const ASSESSMENT_TYPES = ["KEYA", "KPSEA", "KMYA", "KILEA", "KCBE"];

export default function TeacherKnecPage() {
    const students = useQuery(api.cbc_reports.generateClassReport, {})?.students || [];
    const recordScore = useMutation(api.cbc_pathways.recordKnecAcore);

    // Manage Form State
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [assessmentType, setAssessmentType] = useState<string>("");
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [totalScore, setTotalScore] = useState<string>("");

    // Simple subject entry for this MVP (could be dynamic)
    const [mathScore, setMathScore] = useState("");
    const [engScore, setEngScore] = useState("");
    const [kiswaScore, setKiswaScore] = useState("");
    const [sciScore, setSciScore] = useState("");
    const [socScore, setSocScore] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSubmit = async () => {
        if (!selectedStudent || !assessmentType || !year || !totalScore) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const student = students.find(s => s.id === selectedStudent);

            await recordScore({
                studentId: selectedStudent as Id<"users">,
                assessmentType: assessmentType as any,
                year: parseInt(year),
                grade: student?.grade || "N/A",
                totalScore: parseInt(totalScore),
                maxScore: 500, // Standard max
                subjects: [
                    { name: "Mathematics", score: parseInt(mathScore) || 0, maxScore: 100 },
                    { name: "English", score: parseInt(engScore) || 0, maxScore: 100 },
                    { name: "Kiswahili", score: parseInt(kiswaScore) || 0, maxScore: 100 },
                    { name: "Integ. Science", score: parseInt(sciScore) || 0, maxScore: 100 },
                    { name: "Social Studies", score: parseInt(socScore) || 0, maxScore: 100 },
                ]
            });

            toast.success("Assessment score recorded successfully");
            setIsDialogOpen(false);
            // Reset form
            setTotalScore("");
            setMathScore("");
            setEngScore("");
        } catch (error) {
            toast.error("Failed to record score");
            console.error(error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">KNEC Assessments</h1>
                    <p className="text-zinc-500 mt-1">Record and manage National Assessment scores</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusIcon className="h-4 w-4" />
                            Record New Score
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Record National Assessment Score</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Student</Label>
                                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Assessment Type</Label>
                                    <Select value={assessmentType} onValueChange={setAssessmentType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ASSESSMENT_TYPES.map(t => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <Label className="text-base font-semibold">Subject Scores (Out of 100)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Mathematics</Label><Input type="number" value={mathScore} onChange={e => setMathScore(e.target.value)} /></div>
                                    <div><Label>English</Label><Input type="number" value={engScore} onChange={e => setEngScore(e.target.value)} /></div>
                                    <div><Label>Kiswahili</Label><Input type="number" value={kiswaScore} onChange={e => setKiswaScore(e.target.value)} /></div>
                                    <div><Label>Integ. Science</Label><Input type="number" value={sciScore} onChange={e => setSciScore(e.target.value)} /></div>
                                    <div><Label>Social Studies</Label><Input type="number" value={socScore} onChange={e => setSocScore(e.target.value)} /></div>
                                </div>
                            </div>

                            <div className="space-y-2 bg-zinc-50 p-4 rounded-lg">
                                <Label>Overall Total Score (Out of 500)</Label>
                                <Input className="text-lg font-bold" type="number" value={totalScore} onChange={e => setTotalScore(e.target.value)} />
                            </div>

                            <Button onClick={handleSubmit} className="w-full">Save Assessment Record</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5 text-blue-600" />
                        Class Performance Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-zinc-500">
                        {/* Placeholder for list - would implement getTeacherKnecRecords query if needed, 
                            but for MVP we just show the entry form is working */}
                        <p>Select "Record New Score" to add assessment data.</p>
                        <p className="text-sm mt-2">Recorded scores will appear in student profiles and admin analytics.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
