"use client";

import { PostEditor } from "@/components/discuss/posts/post-editor";
import {
  DiscussService,
  type Post,
  type Tag,
} from "@/services/discuss-service";
import { toastService } from "@/services/toasts-service";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

export default function EditPostPage() {
  const { t } = useTranslation("discuss");
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postId = params?.id as string;
        if (!postId) return;
        const data = await DiscussService.getPostById(postId);
        if (data) {
          setPost(data);
          if (session?.user?.id && data.author.id !== Number(session.user.id)) {
            toastService.error(t("not_authorized_edit"));
            router.push(`/discuss/${postId}`);
          }
        } else {
          toastService.error("Post not found");
          router.push("/discuss");
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
        toastService.error(t("failed_load_post"));
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchPost();
    } else if (session === null) {
      // Not logged in
      router.push("/login");
    }
  }, [params, session, router]);

  const handleUpdate = async (data: {
    title: string;
    content: string;
    tags: Tag[];
  }) => {
    try {
      const postId = params?.id as string;
      if (!postId) return;
      await DiscussService.updatePost(postId, {
        title: data.title,
        content: data.content,
        tags: data.tags,
      });
      toastService.success(t("post_updated_success"));
      router.push(`/discuss/${params?.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update post:", error);
      toastService.error(t("failed_update_post"));
      throw error;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <PostEditor
      initialData={{
        title: post.title,
        content: post.content,
        tags: post.tags,
      }}
      onSubmit={handleUpdate}
      onCancel={handleCancel}
      submitLabel={t("update_post_btn")}
      pageTitle={t("edit_post_title")}
    />
  );
}
