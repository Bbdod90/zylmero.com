import { openSharedDemo } from "@/actions/demo";

export const dynamic = "force-dynamic";

export default async function SharedDemoPage({
  params,
}: {
  params: { slug: string };
}) {
  await openSharedDemo(params.slug);
}
