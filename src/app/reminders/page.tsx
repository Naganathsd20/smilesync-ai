"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  getUserSmartReminders,
  generateSmartRemindersForUser,
  toggleReminderCompletion,
  sendReminderEmail,
} from "@/lib/actions/reminders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BellIcon,
  SparklesIcon,
  CalendarIcon,
  MailIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  ActivityIcon,
  CalendarCheckIcon,
  ShieldAlertIcon,
  SparkleIcon,
  InfoIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

interface ReminderItem {
  id: string;
  title: string;
  description: string;
  type: "APPOINTMENT" | "CHECKUP" | "ASSESSMENT_FOLLOWUP" | "HABIT";
  dueDate: string | Date;
  isCompleted: boolean;
  sentEmail: boolean;
  createdAt: string | Date;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const loadReminders = async () => {
    try {
      setLoading(true);
      const res = await getUserSmartReminders();
      if (res.success && res.reminders) {
        setReminders(res.reminders);
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load smart reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await generateSmartRemindersForUser();
      if (res.success) {
        toast.success(res.message || "Smart reminders generated!");
        await loadReminders();
      } else {
        toast.error(res.error || "Failed to generate reminders.");
      }
    } catch {
      toast.error(
        "An unexpected error occurred while generating smart reminders.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleCompletion = async (reminderId: string) => {
    try {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r,
        ),
      );
      const res = await toggleReminderCompletion(reminderId);
      if (!res.success) {
        toast.error(res.error || "Failed to update reminder status");
        await loadReminders();
      } else {
        toast.success("Reminder status updated");
      }
    } catch {
      toast.error("Failed to update completion status");
      await loadReminders();
    }
  };

  const handleSendEmail = async (reminderId: string) => {
    try {
      setSendingEmailId(reminderId);
      const res = await sendReminderEmail(reminderId);
      if (res.success) {
        toast.success("Reminder email dispatched to your inbox!");
        setReminders((prev) =>
          prev.map((r) =>
            r.id === reminderId ? { ...r, sentEmail: true } : r,
          ),
        );
      } else {
        toast.error(res.error || "Failed to send email.");
      }
    } catch {
      toast.error("Failed to send email notification.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const upcoming = reminders.filter((r) => !r.isCompleted);
  const completed = reminders.filter((r) => r.isCompleted);

  const getBadgeStyle = (type: ReminderItem["type"]) => {
    switch (type) {
      case "APPOINTMENT":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "CHECKUP":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "ASSESSMENT_FOLLOWUP":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "HABIT":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: ReminderItem["type"]) => {
    switch (type) {
      case "APPOINTMENT":
        return <CalendarCheckIcon className="w-3.5 h-3.5" />;
      case "CHECKUP":
        return <ActivityIcon className="w-3.5 h-3.5" />;
      case "ASSESSMENT_FOLLOWUP":
        return <ShieldAlertIcon className="w-3.5 h-3.5" />;
      case "HABIT":
        return <SparkleIcon className="w-3.5 h-3.5" />;
    }
  };

  const renderReminderList = (
    items: ReminderItem[],
    isCompletedTab = false,
  ) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card/40">
          {isCompletedTab ? (
            <>
              <CheckCircle2Icon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-base font-semibold text-foreground">
                No Completed Reminders Yet
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                When you check off upcoming smart reminders, they will appear
                here in your history.
              </p>
            </>
          ) : (
            <>
              <BellIcon className="w-12 h-12 text-primary/40 mx-auto mb-3" />
              <p className="text-base font-semibold text-foreground">
                No Upcoming Reminders
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Click below to generate personalized smart follow-ups from your
                appointments, risk assessments, and care plan.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {generating ? (
                  <RefreshCwIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
                Generate Smart Reminders
              </Button>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((reminder) => {
          const dueDateObj = new Date(reminder.dueDate);
          const formattedDueDate = dueDateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <Card
              key={reminder.id}
              className={`transition-all duration-200 border-border/80 ${
                reminder.isCompleted
                  ? "bg-muted/20 opacity-75"
                  : "bg-gradient-to-r from-card via-card to-card/90 hover:border-primary/40 shadow-sm"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Left Column: Checkbox + Title + Description */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <Checkbox
                      checked={reminder.isCompleted}
                      onCheckedChange={() =>
                        handleToggleCompletion(reminder.id)
                      }
                      className="mt-1 h-5 w-5 rounded-md border-primary/50 data-[state=checked]:bg-primary"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3
                          className={`text-base font-semibold ${
                            reminder.isCompleted
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {reminder.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 font-medium flex items-center gap-1.5 ${getBadgeStyle(
                            reminder.type,
                          )}`}
                        >
                          {getTypeIcon(reminder.type)}
                          {reminder.type.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {reminder.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-foreground/80">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                          Due: {formattedDueDate}
                        </span>
                        {reminder.sentEmail && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <MailIcon className="w-3.5 h-3.5" />
                            Email Sent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      size="sm"
                      variant={reminder.sentEmail ? "secondary" : "outline"}
                      disabled={sendingEmailId === reminder.id}
                      onClick={() => handleSendEmail(reminder.id)}
                      className="text-xs h-9 gap-1.5 border-border hover:bg-accent"
                    >
                      {sendingEmailId === reminder.id ? (
                        <RefreshCwIcon className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <MailIcon className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>
                        {reminder.sentEmail ? "Resend Email" : "Send Email"}
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24 space-y-6 sm:space-y-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BellIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                AI Smart Follow-Up & Reminders
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl pt-1">
              SmileSync AI evaluates your appointments, oral health risk
              assessments, and care plans to generate intelligent, personalized
              preventative dental follow-ups.
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shrink-0"
          >
            {generating ? (
              <RefreshCwIcon className="w-5 h-5 animate-spin" />
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
            <span>Generate Smart Reminders</span>
          </Button>
        </div>

        {/* Tab Controls & Content */}
        <Tabs
          defaultValue="upcoming"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="grid grid-cols-2 w-full sm:w-80">
              <TabsTrigger
                value="upcoming"
                className="text-sm flex items-center gap-2"
              >
                <span>Upcoming</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                  {upcoming.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="text-sm flex items-center gap-2"
              >
                <span>Completed</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                  {completed.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-24 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-24 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-24 bg-muted/30 animate-pulse rounded-xl" />
            </div>
          ) : (
            <>
              <TabsContent value="upcoming" className="mt-0">
                {renderReminderList(upcoming, false)}
              </TabsContent>
              <TabsContent value="completed" className="mt-0">
                {renderReminderList(completed, true)}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Medical Safety & Educational Disclaimer Notice */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">
                Medical Safety Disclaimer
              </p>
              <p>
                SmileSync AI Smart Follow-Up & Reminders are designed for
                educational and preventative care tracking only. They do not
                replace professional dental diagnoses or medical advice. For
                severe pain, bleeding, or urgent symptoms, please consult a
                qualified dental professional immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
