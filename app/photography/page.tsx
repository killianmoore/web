import type { Metadata } from "next";
import { PhotographyEntry } from "@/components/photography-entry";
import { getAllPhotos } from "@/lib/photography-data";

export const metadata: Metadata = {
  title: "Photography",
  description: "Photography series by Killian Moore."
};

export default async function PhotographyPage() {
  const photos = await getAllPhotos();

  return <PhotographyEntry photos={photos} />;
}
