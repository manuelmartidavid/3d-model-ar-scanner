import type { Kit } from "@/lib/kits";
import { footprint } from "@/lib/kits";

export default function Readouts({ kit }: { kit: Kit }) {
  return (
    <div className="readouts">
      <div className="ro">
        <div className="k">Footprint</div>
        <div className="val">{footprint(kit)}</div>
      </div>
      <div className="ro">
        <div className="k">Print time</div>
        <div className="val">{kit.printTime}</div>
      </div>
      <div className="ro">
        <div className="k">Filament</div>
        <div className="val">{kit.filament}</div>
      </div>
    </div>
  );
}
