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

export function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  btp: "BTP",
  notaire: "Notaire",
  avocat: "Avocat",
  geometre: "Géomètre",
  architecte: "Architecte",
  courtier: "Courtier",
  diagnostiqueur: "Diagnostiqueur",
  assureur: "Assureur",
  energie_durable: "Énergie durable",
};

export function getServiceCategoryLabel(cat: string): string {
  return SERVICE_CATEGORY_LABELS[cat] || cat;
}

export function getServiceCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    btp: "bg-orange-100 text-orange-700",
    notaire: "bg-purple-100 text-purple-700",
    avocat: "bg-indigo-100 text-indigo-700",
    geometre: "bg-teal-100 text-teal-700",
    architecte: "bg-sky-100 text-sky-700",
    courtier: "bg-amber-100 text-amber-700",
    diagnostiqueur: "bg-rose-100 text-rose-700",
    assureur: "bg-emerald-100 text-emerald-700",
    energie_durable: "bg-green-100 text-green-700",
  };
  return colors[cat] || "bg-gray-100 text-gray-700";
}

export function getLeadStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    soumis: "Soumis",
    en_qualification: "En qualification",
    qualifie: "Qualifié",
    accepte: "Accepté",
    rejete: "Rejeté",
    converti: "Converti",
  };
  return labels[status] || status;
}

export function getLeadStatusStyle(status: string): {
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  const styles: Record<string, { bgClass: string; textClass: string; borderClass: string }> = {
    soumis: {
      bgClass: "bg-secondary",
      textClass: "text-foreground",
      borderClass: "border-border",
    },
    en_qualification: {
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      borderClass: "border-primary/20",
    },
    qualifie: {
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/20",
    },
    accepte: {
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/20",
    },
    rejete: {
      bgClass: "bg-muted",
      textClass: "text-muted-foreground",
      borderClass: "border-muted",
    },
    converti: {
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      borderClass: "border-primary/20",
    },
  };
  return (
    styles[status] || {
      bgClass: "bg-secondary",
      textClass: "text-foreground",
      borderClass: "border-border",
    }
  );
}

export function getQuoteStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    demande: "Demandé",
    envoye: "Envoyé",
    accepte: "Accepté",
    refuse: "Refusé",
    expire: "Expiré",
  };
  return labels[status] || status;
}

export function getQuoteStatusStyle(status: string): {
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  const styles: Record<string, { bgClass: string; textClass: string; borderClass: string }> = {
    demande: {
      bgClass: "bg-amber-100",
      textClass: "text-amber-700",
      borderClass: "border-amber-200",
    },
    envoye: {
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      borderClass: "border-primary/20",
    },
    accepte: {
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/20",
    },
    refuse: {
      bgClass: "bg-red-100",
      textClass: "text-red-700",
      borderClass: "border-red-200",
    },
    expire: {
      bgClass: "bg-muted",
      textClass: "text-muted-foreground",
      borderClass: "border-muted",
    },
  };
  return (
    styles[status] || {
      bgClass: "bg-secondary",
      textClass: "text-foreground",
      borderClass: "border-border",
    }
  );
}
