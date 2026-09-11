"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  ActivityIcon,
} from "lucide-react";
import {
  createOralHealthAssessment,
  AssessmentInput,
} from "@/lib/actions/assessment";
import { toast } from "sonner";

import AssessmentResult from "@/components/assessment/AssessmentResult";

// Wizard Step Configuration
interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

const STEP_1_SYMPTOMS: QuestionOption[] = [
  {
    id: "sensitivity",
    label: "Tooth sensitivity",
    description: "Pain or discomfort with hot, cold, or sweet food/drinks",
  },
  {
    id: "bleeding_gums",
    label: "Bleeding or swollen gums",
    description: "Gums bleed during brushing, flossing, or eating",
  },
  {
    id: "toothache",
    label: "Persistent toothache or throbbing",
    description: "Constant or recurring ache in one or more teeth",
  },
  {
    id: "bad_breath",
    label: "Bad breath or persistent bad taste",
    description: "Unpleasant breath odor that persists after brushing",
  },
  {
    id: "dry_mouth",
    label: "Dry mouth",
    description: "Feeling lack of saliva or sticky sensation in mouth",
  },
  {
    id: "jaw_pain",
    label: "Jaw popping, clicking, or tension",
    description: "Discomfort or noise in jaw joint when chewing/opening",
  },
  {
    id: "none",
    label: "None of these",
    description: "I do not currently experience any of these symptoms",
  },
];

const STEP_2_HYGIENE: QuestionOption[] = [
  {
    id: "twice_plus_floss",
    label: "Brush 2+ times daily and floss daily",
    description: "Optimal daily oral care routine",
  },
  {
    id: "twice_no_floss",
    label: "Brush 2+ times daily, but don't floss",
    description: "Regular brushing without flossing",
  },
  {
    id: "once_daily",
    label: "Brush once daily",
    description: "Single daily brushing session",
  },
  {
    id: "irregular",
    label: "Brushing is irregular",
    description: "Occasional or missed brushing",
  },
];

const STEP_3_CHECKUP: QuestionOption[] = [
  {
    id: "under_6_months",
    label: "Within the last 6 months",
    description: "Up to date routine dental checkup",
  },
  {
    id: "6_12_months",
    label: "6–12 months ago",
    description: "Recent checkup within the past year",
  },
  {
    id: "1_2_years",
    label: "1–2 years ago",
    description: "Slightly overdue for checkup",
  },
  {
    id: "over_2_years",
    label: "More than 2 years ago / Never",
    description: "Significantly overdue or no history of checkups",
  },
];

const STEP_4_LIFESTYLE: QuestionOption[] = [
  {
    id: "sugar_acid",
    label: "Frequent sugary drinks or acidic foods",
    description: "Regular consumption of soda, sweets, citrus",
  },
  {
    id: "tobacco",
    label: "Tobacco, smoking, or vaping",
    description: "Use of cigarettes, cigars, chew, or e-cigarettes",
  },
  {
    id: "coffee_tea_soda",
    label: "Frequent coffee, tea, or soda",
    description: "Daily dark or caffeinated beverages",
  },
  {
    id: "bruxism",
    label: "Teeth grinding / bruxism",
    description: "Clenching or grinding teeth during sleep or stress",
  },
  {
    id: "none",
    label: "None of these",
    description: "None of these lifestyle factors apply to me",
  },
];

const STEP_5_MEDICAL: QuestionOption[] = [
  {
    id: "diabetes_high_bp",
    label: "Diabetes or high blood pressure",
    description: "Systemic health conditions affecting oral tissues",
  },
  {
    id: "braces_aligners_dentures",
    label: "Braces, aligners, or dentures",
    description: "Orthodontic or prosthetic appliances",
  },
  {
    id: "pregnancy",
    label: "Pregnancy",
    description: "Hormonal changes impacting gum sensitivity",
  },
  {
    id: "high_stress",
    label: "High stress levels",
    description: "Stress impacting immune response or jaw tension",
  },
  {
    id: "none",
    label: "None of these",
    description: "None of these health conditions apply to me",
  },
];

export default function AssessmentWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<any | null>(null);

  // Form State
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [hygiene, setHygiene] = useState<string>("");
  const [lastCheckup, setLastCheckup] = useState<string>("");
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [medical, setMedical] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");

  // Mutually Exclusive Multi-Select Handler
  const handleMultiSelectToggle = (
    value: string,
    currentSelections: string[],
    setSelections: (val: string[]) => void,
  ) => {
    if (value === "none") {
      setSelections(["none"]);
      return;
    }

    const filtered = currentSelections.filter((item) => item !== "none");
    if (filtered.includes(value)) {
      const updated = filtered.filter((item) => item !== value);
      setSelections(updated);
    } else {
      setSelections([...filtered, value]);
    }
  };

  // Step Validation
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return symptoms.length > 0;
      case 2:
        return hygiene !== "";
      case 3:
        return lastCheckup !== "";
      case 4:
        return lifestyle.length > 0;
      case 5:
        return medical.length > 0;
      default:
        return false;
    }
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!isStepValid() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: AssessmentInput = {
        symptoms: symptoms as any,
        hygiene: hygiene as any,
        lastCheckup: lastCheckup as any,
        lifestyle: lifestyle as any,
        medical: medical as any,
        notes: notes.trim() || undefined,
      };

      const result = await createOralHealthAssessment(payload);

      if (!result.success) {
        const errorMsg =
          result.error || "Failed to process oral health assessment.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      setCompletedResult(result.assessment);
      toast.success("AI Oral Health Risk Assessment completed successfully!");
    } catch (err: any) {
      const msg =
        err?.message || "An unexpected error occurred during submission.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = (currentStep / 5) * 100;

  const handleReset = () => {
    setCompletedResult(null);
    setCurrentStep(1);
    setSymptoms([]);
    setHygiene("");
    setLastCheckup("");
    setLifestyle([]);
    setMedical([]);
    setNotes("");
    setError(null);
  };

  if (completedResult) {
    return <AssessmentResult result={completedResult} onReset={handleReset} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Progress Bar & Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
          <span>Step {currentStep} of 5</span>
          <span>{Math.round(progressPercent)}% Completed</span>
        </div>
        <Progress value={progressPercent} className="h-2 rounded-full" />
      </div>

      {/* Main Wizard Card */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
        {/* STEP 1: SYMPTOMS */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <ActivityIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Step 1: Current Symptoms
                  </CardTitle>
                  <CardDescription>
                    Select any dental or mouth discomfort you are currently
                    experiencing (Select all that apply).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {STEP_1_SYMPTOMS.map((option) => {
                const isSelected = symptoms.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleMultiSelectToggle(option.id, symptoms, setSymptoms)
                    }
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border/60 bg-card hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground text-sm md:text-base">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                    <div
                      className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </>
        )}

        {/* STEP 2: HYGIENE */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Step 2: Daily Oral Hygiene
                  </CardTitle>
                  <CardDescription>
                    Select the option that best describes your daily
                    toothbrushing and flossing habits.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {STEP_2_HYGIENE.map((option) => {
                const isSelected = hygiene === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setHygiene(option.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border/60 bg-card hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground text-sm md:text-base">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                    <div
                      className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && (
                        <div className="size-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </>
        )}

        {/* STEP 3: CHECKUP */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <StethoscopeIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Step 3: Last Dental Checkup
                  </CardTitle>
                  <CardDescription>
                    How long has it been since your last professional dental
                    examination or cleaning?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {STEP_3_CHECKUP.map((option) => {
                const isSelected = lastCheckup === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLastCheckup(option.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border/60 bg-card hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground text-sm md:text-base">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                    <div
                      className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && (
                        <div className="size-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </>
        )}

        {/* STEP 4: LIFESTYLE */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <ActivityIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Step 4: Lifestyle & Dietary Factors
                  </CardTitle>
                  <CardDescription>
                    Select dietary and habits that apply to your daily life
                    (Select all that apply).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {STEP_4_LIFESTYLE.map((option) => {
                const isSelected = lifestyle.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleMultiSelectToggle(
                        option.id,
                        lifestyle,
                        setLifestyle,
                      )
                    }
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border/60 bg-card hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground text-sm md:text-base">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                    <div
                      className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </>
        )}

        {/* STEP 5: MEDICAL & NOTES */}
        {currentStep === 5 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Step 5: Health & Dental Factors
                  </CardTitle>
                  <CardDescription>
                    Select any medical or dental conditions that apply to you,
                    plus any extra notes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {STEP_5_MEDICAL.map((option) => {
                  const isSelected = medical.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        handleMultiSelectToggle(option.id, medical, setMedical)
                      }
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                          : "border-border/60 bg-card hover:bg-muted/50 hover:border-border"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-foreground text-sm md:text-base">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                      <div
                        className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* OPTIONAL NOTES FIELD */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="assessment-notes"
                    className="text-sm font-semibold text-foreground"
                  >
                    Anything else you'd like us to know?{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {notes.length}/500
                  </span>
                </div>
                <Textarea
                  id="assessment-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Describe any specific concerns, recent changes, or questions..."
                  className="rounded-xl min-h-[90px] resize-none text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  🔒 Please do not include highly sensitive personal information
                  or medical identification numbers.
                </p>
              </div>
            </CardContent>
          </>
        )}

        {/* ERROR DISPLAY */}
        {error && (
          <div className="px-6 py-3 bg-destructive/10 border-t border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-muted/40 border-t border-border/50 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isSubmitting}
            className="rounded-xl font-medium"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
          </Button>

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              disabled={!isStepValid()}
              className="rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white"
            >
              Next <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing with AI...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Get My AI Assessment</span>
                </div>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
