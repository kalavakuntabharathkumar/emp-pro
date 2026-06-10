import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListPerformanceReviews,
  useCreatePerformanceReview,
  useListEmployees,
  getListPerformanceReviewsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Star } from "lucide-react";

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min="1"
        max="5"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="1–5"
        className="h-8"
      />
    </div>
  );
}

function NewReviewDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: employeesData } = useListEmployees();
  const createReview = useCreatePerformanceReview({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPerformanceReviewsQueryKey() });
        onClose();
      },
    },
  });

  const [form, setForm] = useState({
    employee_id: "",
    period: "",
    overall_rating: "",
    productivity_rating: "",
    quality_rating: "",
    teamwork_rating: "",
    communication_rating: "",
    goals_achieved: "",
    goals_total: "",
    comments: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id || !form.period || !form.overall_rating) return;
    createReview.mutate({
      data: {
        employee_id: Number(form.employee_id),
        period: form.period,
        overall_rating: Number(form.overall_rating),
        productivity_rating: form.productivity_rating ? Number(form.productivity_rating) : null,
        quality_rating: form.quality_rating ? Number(form.quality_rating) : null,
        teamwork_rating: form.teamwork_rating ? Number(form.teamwork_rating) : null,
        communication_rating: form.communication_rating
          ? Number(form.communication_rating)
          : null,
        goals_achieved: form.goals_achieved ? Number(form.goals_achieved) : null,
        goals_total: form.goals_total ? Number(form.goals_total) : null,
        comments: form.comments || null,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Performance Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Employee *</Label>
            <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee..." />
              </SelectTrigger>
              <SelectContent>
                {employeesData?.employees?.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rev-period">Review Period *</Label>
            <Input
              id="rev-period"
              value={form.period}
              onChange={(e) => set("period", e.target.value)}
              placeholder="e.g. Q2 2026"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rev-overall">Overall Rating (1–5) *</Label>
            <Input
              id="rev-overall"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={form.overall_rating}
              onChange={(e) => set("overall_rating", e.target.value)}
              placeholder="4.0"
              required
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm">Category Ratings (optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <RatingInput
                label="Productivity"
                value={form.productivity_rating}
                onChange={(v) => set("productivity_rating", v)}
              />
              <RatingInput
                label="Quality"
                value={form.quality_rating}
                onChange={(v) => set("quality_rating", v)}
              />
              <RatingInput
                label="Teamwork"
                value={form.teamwork_rating}
                onChange={(v) => set("teamwork_rating", v)}
              />
              <RatingInput
                label="Communication"
                value={form.communication_rating}
                onChange={(v) => set("communication_rating", v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rev-goals-achieved">Goals Achieved</Label>
              <Input
                id="rev-goals-achieved"
                type="number"
                min="0"
                value={form.goals_achieved}
                onChange={(e) => set("goals_achieved", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rev-goals-total">Goals Total</Label>
              <Input
                id="rev-goals-total"
                type="number"
                min="0"
                value={form.goals_total}
                onChange={(e) => set("goals_total", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rev-comments">Comments</Label>
            <Textarea
              id="rev-comments"
              value={form.comments}
              onChange={(e) => set("comments", e.target.value)}
              placeholder="Summary of employee performance..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createReview.isPending || !form.employee_id || !form.period || !form.overall_rating
              }
            >
              {createReview.isPending ? "Saving…" : "Create Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Performance() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: reviews, isLoading } = useListPerformanceReviews();

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 3.5) return "text-blue-500";
    if (rating >= 2.5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Reviews</h2>
          <p className="text-muted-foreground">Manage employee evaluations and goals.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Review
        </Button>
      </div>

      <NewReviewDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : reviews?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            No performance reviews found.
          </div>
        ) : (
          reviews?.map((review) => (
            <Card key={review.id} className="hover-elevate shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{review.employee_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Period: {review.period}
                  </p>
                </div>
                <Badge
                  variant={review.status === "submitted" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {review.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mt-2 mb-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Overall
                    </span>
                    <div className="flex items-center gap-1">
                      <Star
                        className={`h-5 w-5 fill-current ${getRatingColor(review.overall_rating)}`}
                      />
                      <span className="text-2xl font-bold">{review.overall_rating}</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-border"></div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Productivity</span>
                      <span className="font-medium">{review.productivity_rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quality</span>
                      <span className="font-medium">{review.quality_rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teamwork</span>
                      <span className="font-medium">{review.teamwork_rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Goals</span>
                      <span className="font-medium">
                        {review.goals_achieved}/{review.goals_total}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comments && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md italic line-clamp-2">
                    "{review.comments}"
                  </p>
                )}
                <div className="mt-4 text-xs text-muted-foreground text-right">
                  Reviewer: {review.reviewer_name}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
