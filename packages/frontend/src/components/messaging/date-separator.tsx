import { formatMessageDate } from "@/lib/format";

export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-body">
        {formatMessageDate(date)}
      </span>
    </div>
  );
}
