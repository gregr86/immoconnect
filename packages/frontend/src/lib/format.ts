export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;

  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `il y a ${diffDays}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const messageDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (messageDay.getTime() === today.getTime()) return "Aujourd'hui";
  if (messageDay.getTime() === yesterday.getTime()) return "Hier";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function getFileIconStyle(mimeType: string): {
  bgClass: string;
  textClass: string;
} {
  if (mimeType === "application/pdf") {
    return { bgClass: "bg-red-100", textClass: "text-red-600" };
  }
  if (
    mimeType === "application/acad" ||
    mimeType === "image/vnd.dwg" ||
    mimeType.includes("dwg")
  ) {
    return { bgClass: "bg-blue-100", textClass: "text-blue-600" };
  }
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType.includes("zip") ||
    mimeType.includes("rar")
  ) {
    return { bgClass: "bg-orange-100", textClass: "text-orange-600" };
  }
  if (mimeType.startsWith("image/")) {
    return { bgClass: "bg-green-100", textClass: "text-green-600" };
  }
  return { bgClass: "bg-gray-100", textClass: "text-gray-600" };
}
