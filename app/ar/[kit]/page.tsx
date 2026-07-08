import { resolveKit } from "@/lib/kits";
import Viewer from "@/components/Viewer";
import Hud from "@/components/Hud";
import Readouts from "@/components/Readouts";
import NoticeBanner from "@/components/NoticeBanner";

export default async function ArKitPage({
  params,
}: {
  params: Promise<{ kit: string }>;
}) {
  const { kit: kitParam } = await params;
  const { kit, requestedId, isFallback } = resolveKit(kitParam);

  return (
    <>
      <Hud statusId={kit.id} />
      <main>
        <Viewer kit={kit} />
        <div className="title">
          <h1>{kit.name}</h1>
          <p>{kit.tagline}</p>
        </div>
        <div className="cta-wrap">
          {isFallback && <NoticeBanner requestedId={requestedId} />}
        </div>
        <Readouts kit={kit} />
      </main>
      <footer>QR → AR · true-scale placement · no app install</footer>
    </>
  );
}
