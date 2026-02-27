"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscussService } from "@/services/discuss-service";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TrendingTopic {
  id: number;
  name: string;
  slug: string;
  color: string;
  postCount: number;
}

interface TrendingTopicsProps {
  onTopicClick?: (topic: TrendingTopic) => void;
}

export function TrendingTopics({ onTopicClick }: TrendingTopicsProps) {
  const { t } = useTranslation("discuss");
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await DiscussService.getTrendingTopics();
        setTopics(data);
      } catch (error) {
        console.error("Failed to fetch trending topics", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (topics.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="bg-card/50 border-border/60 backdrop-blur-sm">
      <CardHeader className="pb-2 border-b border-border/40">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          {t("trending_topics")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-4">
        <div className="space-y-4">
          {isLoading
            ? // Simple skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))
            : topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between text-sm group cursor-pointer hover:bg-accent/10 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                  onClick={() => onTopicClick?.(topic)}
                >
                  <span className="text-foreground font-bold group-hover:underline transition-colors truncate max-w-[180px]">
                    #{topic.name}
                  </span>
                  <span className="text-muted-foreground text-xs whitespace-nowrap ml-2">
                    {t("posts_count", { count: topic.postCount })}
                  </span>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
