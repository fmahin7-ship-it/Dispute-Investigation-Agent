import { CaseDesk } from "@/components/CaseDesk";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Person D — investigation desk for one case */
export default async function CasePage({ params }: PageProps) {
  const { id } = await params;
  return <CaseDesk caseId={id} />;
}
