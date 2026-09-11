"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUserSmartReminders,
  generateSmartRemindersForUser,
  toggleReminderCompletion,
} from "@/lib/actions/reminders";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BellIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  ActivityIcon,
  CalendarCheckIcon,
  ShieldAlertIcon,
  SparkleIcon,
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
}

export function SmartRemindersCard() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await getUserSmartReminders();
      if (res.success && res.reminders) {
        setReminders(res.reminders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await generateSmartRemindersForUser();
      if (res.success) {
        toast.success(res.message || "Smart reminders updated!");
        await fetchReminders();
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

  const handleToggle = async (reminderId: string) => {
    try {
      // Optimistic update
      setReminders((prev) =>
        prev.map((r) =>
          r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r,
        ),
      );
      const res = await toggleReminderCompletion(reminderId);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        await fetchReminders();
      }
    } catch {
      toast.error("Failed to toggle reminder state");
      await fetchReminders();
    }
  };

  const upcomingReminders = reminders.filter((r) => !r.isCompleted);

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

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-primary" />
            AI Smart Reminders
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Intelligent follow-ups based on your oral health records
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
            className="text-xs h-8 gap-1.5 border-primary/30 hover:bg-primary/10"
          >
            {generating ? (
              <RefreshCwIcon className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
              <SparklesIcon className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="hidden sm:inline">Generate</span>
          </Button>
          <Link href="/reminders">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8 gap-1 px-2 text-primary hover:text-primary/80"
            >
              Hub
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {loading ? (
          <div className="space-y-2 py-4">
            <div className="h-12 bg-muted/40 animate-pulse rounded-lg" />
            <div className="h-12 bg-muted/40 animate-pulse rounded-lg" />
          </div>
        ) : upcomingReminders.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
            <CheckCircle2Icon className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-foreground">
              You are all caught up!
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-3">
              No pending smart reminders. Generate new recommendations anytime.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs gap-1.5"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-primary" />
              Generate Smart Reminders
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingReminders.slice(0, 3).map((reminder) => {
              const formattedDate = new Date(
                reminder.dueDate,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={reminder.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/60 bg-card/60 hover:bg-card transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Checkbox
                      checked={reminder.isCompleted}
                      onCheckedChange={() => handleToggle(reminder.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">
                          {reminder.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 font-medium flex items-center gap-1 ${getBadgeStyle(
                            reminder.type,
                          )}`}
                        >
                          {getTypeIcon(reminder.type)}
                          {reminder.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {reminder.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap pt-1">
                    <CalendarIcon className="w-3 h-3 text-muted-foreground/70" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })}

            {upcomingReminders.length > 3 && (
              <div className="text-center pt-1">
                <Link
                  href="/reminders"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  View {upcomingReminders.length - 3} more smart reminder(s)
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SmartRemindersCard;
