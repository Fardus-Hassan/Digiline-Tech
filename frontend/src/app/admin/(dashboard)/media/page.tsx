"use client";

import { Images } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/media-library";

export default function MediaPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Media library" description="All images and videos used on your website. Drop files anywhere to upload — images are optimized automatically." icon={Images} />
      <MediaLibrary />
    </div>
  );
}
