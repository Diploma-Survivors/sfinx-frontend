"use client";

import { GlobalLeaderboardTable } from "@/components/ranking/global-leaderboard-table";
import { GlobalTopSolvers } from "@/components/ranking/global-top-solvers";
import { UserContestHistory } from "@/components/ranking/user-contest-history";
import { useTranslation } from "react-i18next";

export default function RankingPage() {
  const { t } = useTranslation("ranking");

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold text-foreground">
              {t("ranking_title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("ranking_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Panel: Top Solvers & User History */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-8 lg:sticky lg:top-24">
              <GlobalTopSolvers />
              <UserContestHistory />
            </div>

            {/* Right Panel: Leaderboard */}
            <div className="lg:col-span-7 xl:col-span-8">
              <GlobalLeaderboardTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
