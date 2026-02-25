"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, FileText, Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface ContestNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hideNavigation?: boolean;
}

const navItems = [
  { id: "description", label: "description", icon: FileText },
  { id: "ranking", label: "ranking", icon: Trophy },
];

export default function ContestNavbar({
  activeTab,
  onTabChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hideNavigation = false,
}: ContestNavbarProps) {
  const { t } = useTranslation("contests");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Back Button */}
        <Link href="/contests">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("back")}</span>
          </Button>
        </Link>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-none hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{t(item.label)}</span>
              </Button>
            );
          })}
        </div>

        {/* Right Side: Empty Placeholder to balance layout (width of back button approx) */}
        <div className="w-[88px] hidden sm:block" />
      </div>
    </nav>
  );
}
