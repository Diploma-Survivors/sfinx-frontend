"use client";

import { PostEditor } from "@/components/discuss/posts/post-editor";
import { DiscussService, type Tag } from "@/services/discuss-service";
import { toastService } from "@/services/toasts-service";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function CreatePostPage() {
  const { t } = useTranslation("discuss");
  const router = useRouter();

  const handlePublish = async (data: {
    title: string;
    content: string;
    tags: Tag[];
  }) => {
    try {
      const createdPost = await DiscussService.createPost({
        title: data.title,
        content: data.content,
        tags: data.tags,
      });
      toastService.success(t("post_created_success"));
      router.push(`/discuss/${createdPost.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create post:", error);
      toastService.error(t("failed_create_post"));
      throw error;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PostEditor
      onSubmit={handlePublish}
      onCancel={handleCancel}
      submitLabel={t("create_post_btn")}
      pageTitle={t("create_post_title")}
    />
  );
}
