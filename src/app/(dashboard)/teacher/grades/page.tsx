"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { toast } from "sonner";
import { Plus, BookOpen, Check } from "lucide-react";
import { format } from "date-fns";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function TeacherGradesPage() {
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
    const [newAssignmentOpen, setNewAssignmentOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        subject: "",
        title: "",
        maxScore: 100,
        dueDate: new Date().toISOString().split("T")[0],
    });
    const [gradingStudent, setGradingStudent] = useState<{ id: string; name: string } | null>(null);
    const [gradeInput, setGradeInput] = useState({ score: "", feedback: "" });

    const assignments = useQuery(api.grades.getAllAssignments);
    const students = useQuery(api.attendance.getAllStudents);
    const results = useQuery(
        api.grades.getResultsByAssignment,
        selectedAssignment ? { assignmentId: selectedAssignment as Id<"assignments"> } : "skip"
    );

    const createAssignment = useMutation(api.grades.createAssignment);
    const gradeStudent = useMutation(api.grades.gradeStudent);

    const handleCreateAssignment = async () => {
        if (!newAssignment.subject || !newAssignment.title) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            await createAssignment({
                subject: newAssignment.subject,
                title: newAssignment.title,
                maxScore: newAssignment.maxScore,
                dueDate: new Date(newAssignment.dueDate).getTime(),
            });
            toast.success("Assignment created");
            setNewAssignmentOpen(false);
            setNewAssignment({ subject: "", title: "", maxScore: 100, dueDate: new Date().toISOString().split("T")[0] });
        } catch {
            toast.error("Failed to create assignment");
        }
    };

    const handleGradeStudent = async () => {
        if (!gradingStudent || !selectedAssignment || !gradeInput.score) {
            toast.error("Please enter a score");
            return;
        }
        try {
            await gradeStudent({
                assignmentId: selectedAssignment as Id<"assignments">,
                studentId: gradingStudent.id as Id<"users">,
                score: Number(gradeInput.score),
                feedback: gradeInput.feedback || undefined,
            });
            toast.success(`Graded ${gradingStudent.name}`);
            setGradingStudent(null);
            setGradeInput({ score: "", feedback: "" });
        } catch {
            toast.error("Failed to save grade");
        }
    };

    const getStudentGrade = (studentId: string) => {
        if (!results) return null;
        return results.find((r) => r.studentId === studentId);
    };

    const selectedAssignmentData = assignments?.find((a) => a._id === selectedAssignment);

    if (assignments === undefined || students === undefined) {
        return <LoadingAnimation message="Loading..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Grade Assignments</h1>
                    <p className="text-zinc-500">Create assignments and grade student submissions.</p>
                </div>

                <Dialog open={newAssignmentOpen} onOpenChange={setNewAssignmentOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Assignment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Assignment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Select value={newAssignment.subject} onValueChange={(v) => setNewAssignment({ ...newAssignment, subject: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Science">Science</SelectItem>
                                        <SelectItem value="Kiswahili">Kiswahili</SelectItem>
                                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="e.g., Mid-Term Exam"
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Max Score</label>
                                    <Input
                                        type="number"
                                        value={newAssignment.maxScore}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <Input
                                        type="date"
                                        value={newAssignment.dueDate}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setNewAssignmentOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateAssignment}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Assignments</CardTitle>
                        <CardDescription>{assignments.length} total</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                        {assignments.length === 0 ? (
                            <p className="text-zinc-500 text-center py-4">No assignments yet. Create one to get started.</p>
                        ) : (
                            assignments.map((assignment) => (
                                <button
                                    key={assignment._id}
                                    onClick={() => setSelectedAssignment(assignment._id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedAssignment === assignment._id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-zinc-200 hover:border-zinc-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-sm">{assignment.title}</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">
                                        {assignment.subject} • Due {format(new Date(assignment.dueDate), "MMM d")}
                                    </div>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Grading Panel */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {selectedAssignmentData ? `Grade: ${selectedAssignmentData.title}` : "Select an Assignment"}
                        </CardTitle>
                        {selectedAssignmentData && (
                            <CardDescription>
                                {selectedAssignmentData.subject} • Max Score: {selectedAssignmentData.maxScore}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selectedAssignment ? (
                            <p className="text-zinc-500 text-center py-8">Select an assignment from the left to start grading.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => {
                                        const grade = getStudentGrade(student._id);
                                        const percentage = grade && selectedAssignmentData
                                            ? Math.round((grade.score / selectedAssignmentData.maxScore) * 100)
                                            : null;
                                        return (
                                            <TableRow key={student._id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>
                                                    {grade ? (
                                                        <Badge className={
                                                            percentage! >= 80 ? "bg-green-100 text-green-800" :
                                                                percentage! >= 60 ? "bg-yellow-100 text-yellow-800" :
                                                                    "bg-red-100 text-red-800"
                                                        }>
                                                            {percentage}%
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Not graded</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {grade ? `${grade.score}/${selectedAssignmentData?.maxScore}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Dialog open={gradingStudent?.id === student._id} onOpenChange={(open) => !open && setGradingStudent(null)}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant={grade ? "outline" : "default"}
                                                                onClick={() => {
                                                                    setGradingStudent({ id: student._id, name: student.name });
                                                                    setGradeInput({
                                                                        score: grade ? String(grade.score) : "",
                                                                        feedback: grade?.feedback || "",
                                                                    });
                                                                }}
                                                            >
                                                                {grade ? "Edit" : "Grade"}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Grade {student.name}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Score (out of {selectedAssignmentData?.maxScore})</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={gradeInput.score}
                                                                        onChange={(e) => setGradeInput({ ...gradeInput, score: e.target.value })}
                                                                        max={selectedAssignmentData?.maxScore}
                                                                        min={0}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Feedback (optional)</label>
                                                                    <Textarea
                                                                        placeholder="Great work! Keep it up."
                                                                        value={gradeInput.feedback}
                                                                        onChange={(e) => setGradeInput({ ...gradeInput, feedback: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setGradingStudent(null)}>Cancel</Button>
                                                                <Button onClick={handleGradeStudent}>
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                    Save Grade
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
