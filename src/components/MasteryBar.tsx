export function MasteryBar({ value }: { value: number }) {
  const percentage = Math.round(value * 100);

  return (
    <div className="mastery" aria-label={`Mastery ${percentage}%`}>
      <span style={{ width: `${percentage}%` }} />
    </div>
  );
}
