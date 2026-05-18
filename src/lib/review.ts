import type { ReviewCard, ReviewRating } from "./types";

const ratingMultiplier: Record<ReviewRating, number> = {
  again: 0,
  hard: 1,
  good: 2.4,
  easy: 3.8,
};

export function scheduleReview(card: ReviewCard, rating: ReviewRating, now = new Date()) {
  const nextEase = Math.max(
    1.3,
    card.ease + (rating === "easy" ? 0.15 : rating === "hard" ? -0.15 : rating === "again" ? -0.3 : 0),
  );
  const nextInterval =
    rating === "again"
      ? 0
      : Math.max(1, Math.round(card.intervalDays * ratingMultiplier[rating] * nextEase));
  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + nextInterval);

  return {
    ...card,
    ease: Number(nextEase.toFixed(2)),
    intervalDays: nextInterval,
    dueAt: dueAt.toISOString(),
  };
}

export function isDue(card: ReviewCard, now = new Date()) {
  return new Date(card.dueAt).getTime() <= now.getTime();
}
