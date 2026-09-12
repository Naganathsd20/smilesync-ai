import Navbar from "@/components/Navbar";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import AssessmentHistory from "@/components/assessment/AssessmentHistory";
import { getUserOralHealthAssessments } from "@/lib/actions/assessment";
import { ShieldAlertIcon, SparklesIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Oral Health Risk Assessment - SmileSync AI",
  description:
    "Answer structured oral health questions to receive a personalized, educational AI risk assessment and recommendation summary.",
};

export default async function AssessmentPage() {
  const historyAssessments = await getUserOralHealthAssessments();

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24 min-h-screen space-y-8 sm:space-y-12 overflow-x-hidden">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <SparklesIcon className="w-3.5 h-3.5" /> AI Dental Health Diagnostic
            Assistant
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-foreground">
            AI Oral Health Risk Assessment
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Answer a few structured questions about your oral hygiene, symptoms,
            and lifestyle habits to receive a personalized, educational risk
            assessment summary.
          </p>
        </div>

        {/* MEDICAL DISCLAIMER NOTICE */}
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-700 dark:text-amber-300 text-xs md:text-sm">
          <ShieldAlertIcon className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <span className="font-semibold block mb-0.5">
              Educational Assessment Only
            </span>
            This tool provides an AI-generated educational risk assessment and
            does <strong>NOT</strong> constitute a clinical dental or medical
            diagnosis. For acute pain, emergencies, or personal medical
            concerns, please consult a licensed dental professional.
          </div>
        </div>

        {/* QUESTIONNAIRE WIZARD */}
        <AssessmentWizard />

        {/* ASSESSMENT HISTORY */}
        <div className="max-w-3xl mx-auto">
          <AssessmentHistory assessments={historyAssessments} />
        </div>
      </main>
    </>
  );
}
