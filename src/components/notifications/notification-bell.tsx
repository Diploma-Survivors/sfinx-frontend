"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/hooks/use-socket";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useApp } from "@/contexts/app-context";
import { useTranslation } from "react-i18next";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket("notifications");
  const { user } = useApp();
  const { t } = useTranslation("common");
  const locale = user?.preferredLanguage || "en";

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(0, 20, locale);
      setNotifications(data.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { count } = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (newNotification: Notification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 text-muted-foreground hover:bg-muted/60"
        >
          <Bell className="h-6 w-6 text-foreground" fill="currentColor" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-background bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 sm:w-96 rounded-xl shadow-2xl shadow-black/10 border border-border/50 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
        align="end"
      >
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <h4 className="font-semibold text-foreground">
            {t("notifications")}
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80 h-auto p-0"
              onClick={handleMarkAllAsRead}
            >
              {t("mark_all_read")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-sm">{t("no_notifications")}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col p-4 border-b border-border/40 transition-colors hover:bg-muted/30 cursor-pointer",
                    !notification.isRead &&
                      "bg-accent/5 border-l-2 border-l-accent",
                  )}
                  onClick={() =>
                    handleMarkAsRead(notification.id, notification.isRead)
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-foreground line-clamp-1">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.content}
                  </p>
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-xs text-primary font-medium mt-2 hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("view_details")}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
