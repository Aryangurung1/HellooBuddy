"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  onSubmit: (data: RewardData) => Promise<void>;
  isSubscribed: boolean;
}

interface RewardData {
  title: string;
  description: string;
  endDate: Date;
}

export default function RewardDialog({
  open,
  onOpenChange,
  userEmail,
  onSubmit,
  isSubscribed,
}: RewardDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const handleSubmit = async () => {
    if (!title || !description || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Make 100% certain we're passing a Date object
      // First, log the type to confirm what we're working with
      console.log("endDate type:", Object.prototype.toString.call(endDate));
      console.log("endDate value:", endDate);

      // Use toISOString to ensure proper date format when it gets serialized
      const isoDate = new Date(endDate.getTime());

      console.log("Submitting with date:", isoDate);

      // Submit with our guaranteed Date object
      await onSubmit({
        title,
        description,
        endDate: isoDate,
      });

      onOpenChange(false);
      // Reset form
      setTitle("");
      setDescription("");
      setEndDate(undefined);
    } catch (err) {
      console.error("Failed to send reward:", err);
      setError("Failed to send reward. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Ensure we're storing a proper Date object
      const newDate = new Date(date.getTime());
      console.log("Date selected:", newDate);
      setEndDate(newDate);
    } else {
      setEndDate(undefined);
    }
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Reward</DialogTitle>
          <DialogDescription>
            {isSubscribed
              ? "Extend subscription for " + userEmail
              : "Grant subscription to " + userEmail}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reward Title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the reward..."
            />
          </div>
          <div className="grid gap-2 relative">
            <Label>Valid Until</Label>
            <Button
              type="button"
              ref={buttonRef}
              variant="outline"
              onClick={toggleCalendar}
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </Button>

            {showCalendar && (
              <div
                ref={calendarRef}
                className="absolute top-full left-0 z-50 bg-white border rounded-md shadow-lg mt-1"
              >
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
