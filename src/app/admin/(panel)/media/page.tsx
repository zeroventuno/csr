import MediaManager from "@/components/admin/MediaManager";
import { getMedia } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await getSession();
  const media = await getMedia();
  return <MediaManager items={media} role={session!.role} />;
}
