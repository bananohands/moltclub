import { HomeTheater } from "@/components/home-theater";
import { listGroups } from "@/lib/data/groups";

type HomeGroup = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
};

export default async function HousePage() {
  const groups = (await listGroups().catch(() => [])) as HomeGroup[];
  return <HomeTheater groups={groups} initialScene="stack" />;
}
