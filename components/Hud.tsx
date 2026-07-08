export default function Hud({ statusId }: { statusId: string }) {
  return (
    <div className="hud">
      <div className="eyebrow">
        <b>AR</b>&nbsp;PREVIEW
      </div>
      <div className="stat">
        <span className="dot" />
        <span>READY · {statusId}</span>
      </div>
    </div>
  );
}
