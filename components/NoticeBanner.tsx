export default function NoticeBanner({ requestedId }: { requestedId: string }) {
  return (
    <p className="notice" style={{ display: "block" }}>
      unknown kit &apos;{requestedId}&apos; · showing default
    </p>
  );
}
