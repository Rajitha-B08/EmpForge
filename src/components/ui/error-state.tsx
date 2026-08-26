export function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
      <p className="text-sm font-medium text-destructive">{message}</p>
    </div>
  );
}
