import { useQuery } from "@tanstack/react-query";
import { Bell, Check, MessageSquare, Building2, Zap, Info } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  notificationsQueryOptions,
  notificationUnreadCountQueryOptions,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types";

const typeIcons: Record<NotificationType, typeof Bell> = {
  new_message: MessageSquare,
  property_status_change: Building2,
  new_match: Zap,
  system: Info,
};

export function NotificationDropdown() {
  const navigate = useNavigate();

  const { data: countData } = useQuery(notificationUnreadCountQueryOptions());
  const { data: notifData } = useQuery(notificationsQueryOptions(10));
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = countData?.count ?? 0;
  const notifications = notifData?.items ?? [];

  const handleClick = (notifId: string, link: string | null | undefined, read: boolean) => {
    if (!read) {
      markRead.mutate(notifId);
    }
    if (link) {
      navigate({ to: link });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative text-foreground hover:text-primary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between font-body">
          <span className="font-heading font-bold">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-primary hover:underline font-normal"
            >
              Tout marquer lu
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune notification
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = typeIcons[notif.type] ?? Bell;
            return (
              <DropdownMenuItem
                key={notif.id}
                onClick={() => handleClick(notif.id, notif.link, notif.read)}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 cursor-pointer",
                  !notif.read && "bg-secondary/50",
                )}
              >
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {notif.message}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatRelativeTime(notif.createdAt)}
                  </p>
                </div>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
