import React from "react";
import { format } from "date-fns";
import {
    Users, Target, Brain, Palette, Globe, Monitor, BookOpen,
    CheckCircle, AlertCircle, Clock, XCircle
} from "lucide-react";

interface CBCPrintableReportProps {
    studentName: string;
    studentGrade: string;
    term: string;
    generatedAt: number;
    competencies: {
        competency: string;
        name: string;
        icon: string;
        level: string | null;
        levelName: string;
        evidence: any[];
        comments: string;
        assessmentDate: number | null;
        assessmentCount: number;
    }[];
    statistics: {
        totalAssessed: number;
        totalCompetencies: number;
        meetingStandards: number;
        portfolioItems: number;
        assessmentCount: number;
    };
}

export function CBCPrintableReport({
    studentName,
    studentGrade,
    term,
    generatedAt,
    competencies,
    statistics
}: CBCPrintableReportProps) {
    const getLevelBadge = (level: string | null) => {
        switch (level) {
            case "EE": return "Exceeds Expectations";
            case "ME": return "Meets Expectations";
            case "AE": return "Approaching Expectations";
            case "BE": return "Below Expectations";
            default: return "Not Assessed";
        }
    };

    const getIcon = (id: string, className: string) => {
        switch (id) {
            case "communication_collaboration": return <Users className={className} />;
            case "self_efficacy": return <Target className={className} />;
            case "critical_thinking": return <Brain className={className} />;
            case "creativity_imagination": return <Palette className={className} />;
            case "citizenship": return <Globe className={className} />;
            case "digital_literacy": return <Monitor className={className} />;
            case "learning_to_learn": return <BookOpen className={className} />;
            default: return <Brain className={className} />;
        }
    };

    return (
        <div className="print-only p-8 max-w-4xl mx-auto bg-white text-black hidden print:block">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Detailed Competency Report</h1>
                    <p className="text-lg text-gray-600">Competence Based Curriculum (CBC)</p>
                </div>
                <div className="text-right">
                    <div className="font-bold text-xl">{studentName}</div>
                    <div className="text-gray-600">Grade: {studentGrade}</div>
                    <div className="text-gray-600">{term}</div>
                    <div className="text-sm text-gray-500 mt-2">
                        Generated: {format(generatedAt, "MMM d, yyyy")}
                    </div>
                </div>
            </div>

            {/* Overall Statistics */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
                    Performance Overview
                </h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="text-3xl font-bold text-gray-900">
                            {statistics.totalAssessed}/{statistics.totalCompetencies}
                        </div>
                        <div className="text-xs font-semibold uppercase text-gray-500 mt-1">
                            Competencies Assessed
                        </div>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="text-3xl font-bold text-green-700">
                            {statistics.meetingStandards}
                        </div>
                        <div className="text-xs font-semibold uppercase text-gray-500 mt-1">
                            Meeting Standards
                        </div>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="text-3xl font-bold text-blue-700">
                            {statistics.portfolioItems}
                        </div>
                        <div className="text-xs font-semibold uppercase text-gray-500 mt-1">
                            Portfolio Evidence
                        </div>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="text-3xl font-bold text-gray-900">
                            {statistics.assessmentCount}
                        </div>
                        <div className="text-xs font-semibold uppercase text-gray-500 mt-1">
                            Total Assessments
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Competency Breakdown */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-gray-300 pb-2 break-before-page">
                    Competency Breakdown
                </h2>

                {competencies.map((comp) => (
                    <div key={comp.competency} className="break-inside-avoid mb-6 border border-gray-200 rounded-lg p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 border border-gray-300 rounded-md">
                                    {getIcon(comp.competency, "w-6 h-6 text-gray-700")}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{comp.name}</h3>
                                    <div className="text-sm text-gray-500">
                                        Last Assessed: {comp.assessmentDate ? format(comp.assessmentDate, "MMM d, yyyy") : "N/A"}
                                    </div>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full border text-sm font-bold ${comp.level === 'EE' ? 'bg-green-100 border-green-300 text-green-800' :
                                    comp.level === 'ME' ? 'bg-blue-100 border-blue-300 text-blue-800' :
                                        comp.level === 'AE' ? 'bg-orange-100 border-orange-300 text-orange-800' :
                                            comp.level === 'BE' ? 'bg-red-100 border-red-300 text-red-800' :
                                                'bg-gray-100 border-gray-300 text-gray-800'
                                }`}>
                                {getLevelBadge(comp.level)}
                            </div>
                        </div>

                        {comp.comments && (
                            <div className="bg-gray-50 p-4 rounded-md mb-3">
                                <span className="font-semibold text-sm text-gray-700 block mb-1">Teacher Comments:</span>
                                <p className="text-gray-800 italic">“{comp.comments}”</p>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 flex gap-4 mt-2">
                            <span>• {comp.assessmentCount} Assessments</span>
                            <span>• {comp.evidence?.length || 0} Evidence Items</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Signature Area */}
            <div className="mt-12 pt-8 border-t border-gray-300 page-break-inside-avoid">
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <div className="h-0.5 bg-black w-48 mb-2"></div>
                        <p className="text-sm font-medium">Class Teacher Signature</p>
                    </div>
                    <div>
                        <div className="h-0.5 bg-black w-48 mb-2"></div>
                        <p className="text-sm font-medium">Principal Signature & Stamp</p>
                    </div>
                </div>
                <div className="mt-8 text-center text-xs text-gray-400">
                    Generated by Vadea LMS • {format(new Date(), "PPpp")}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; }
                    .print-hidden { display: none !important; }
                    .print-only { display: block !important; }
                }
            `}</style>
        </div>
    );
}
