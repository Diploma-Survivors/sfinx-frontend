import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Post } from "@/services/discuss-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowBigUp,
  Edit,
  Eye,
  MessageSquare,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface PostCardProps {
  post: Post;
  openInNewTab?: boolean;
}

export function PostCard({ post, openInNewTab }: PostCardProps) {
  const { t } = useTranslation("discuss");
  const router = useRouter();
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { text, images } = useMemo(() => {
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    const imgs: string[] = [];
    let match;
    while ((match = imgRegex.exec(post.content)) !== null) {
      imgs.push(match[1]);
    }
    const cleanText = post.content.replace(imgRegex, "").trim();
    return { text: cleanText, images: imgs };
  }, [post.content]);

  const getDisplayName = () => {
    return post.author.fullName || post.author.username || t("anonymous");
  };

  const getAvatarUrl = () => {
    if (!post.author.avatarKey) return null;
    return `${post.author.avatarUrl}`;
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${post.author.id}`);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      const count = Math.floor(interval);
      return count === 1 ? t("years_ago_one") : t("years_ago_other", { count });
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      const count = Math.floor(interval);
      return count === 1
        ? t("months_ago_one")
        : t("months_ago_other", { count });
    }
    interval = seconds / 86400;
    if (interval > 1) {
      const count = Math.floor(interval);
      return count === 1 ? t("days_ago_one") : t("days_ago_other", { count });
    }
    interval = seconds / 3600;
    if (interval > 1) {
      const count = Math.floor(interval);
      return count === 1 ? t("hours_ago_one") : t("hours_ago_other", { count });
    }
    interval = seconds / 60;
    if (interval > 1) {
      const count = Math.floor(interval);
      return count === 1
        ? t("minutes_ago_one")
        : t("minutes_ago_other", { count });
    }
    const count = Math.floor(seconds);
    return count === 1
      ? t("seconds_ago_one")
      : t("seconds_ago_other", { count });
  };

  return (
    <div className="group border-b border-border py-6 px-4 hover:bg-muted/30 transition-colors first:pt-4">
      <Link href={`/discuss/${post.id}`} className="block space-y-4" target={openInNewTab ? "_blank" : undefined}>
        {/* Header: Avatar, Name, Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getAvatarUrl() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getAvatarUrl()!}
                alt={getDisplayName()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
                {getDisplayName().charAt(0).toUpperCase()}
              </div>
            )}
            <span
              onClick={handleUsernameClick}
              className="text-base font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors cursor-pointer"
            >
              {getDisplayName()}
            </span>
            <span className="text-sm text-muted-foreground">
              • {getTimeAgo(post.createdAt)}
            </span>
          </div>

          {session?.user?.id && Number(session.user.id) === post.author.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={() => router.push(`/discuss/${post.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("edit")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content Area: Title + Text (Left) & Image (Right) */}
        <div className="flex justify-between gap-6">
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1 break-all">
              {post.title}
            </h3>
            <p className="text-base text-muted-foreground line-clamp-3 break-all">
              {text.replace(/[#*`_]/g, "").substring(0, 250)}...
            </p>
          </div>

          {images.length > 0 && (
            <div className="relative w-[200px] h-[130px] shrink-0 group/image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentImageIndex]}
                alt="Post preview"
                className="w-full h-full object-cover rounded-lg border border-border bg-muted/50"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-xs text-white font-medium opacity-0 group-hover/image:opacity-100 transition-opacity">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer: Tags & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="px-2 py-0.5 text-xs font-normal text-muted-foreground bg-muted hover:bg-muted/80"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowBigUp className="w-4 h-4" />
              <span>{post.upvoteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
