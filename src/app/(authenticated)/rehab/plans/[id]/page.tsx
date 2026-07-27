import { PlanDetailView } from "@/modules/rehab/ui/views/PlanDetailView";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlanDetailView planId={id} />;
}
