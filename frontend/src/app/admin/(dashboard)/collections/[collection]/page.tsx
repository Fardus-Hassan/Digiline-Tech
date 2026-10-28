"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getCollectionSchema } from "@/lib/cms/schema";
import { PageHeader } from "@/components/admin/ui";
import { EntryList } from "@/components/admin/entry-list";

export default function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = use(params);
  const schema = getCollectionSchema(collection);
  if (!schema || schema.hidden) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={schema.label} description={schema.description} icon={schema.icon} />
      <EntryList key={schema.key} schema={schema} />
    </div>
  );
}
