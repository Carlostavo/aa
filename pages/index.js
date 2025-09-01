export default function EditorWrapper() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const q = new URLSearchParams({ url: url || '', key: key || '' }).toString();
  const src = `/editor/index.html?${q}`;
  return (
    <div className="iframeWrap">
      <iframe src={src} title="PAE Editor" />
    </div>
  );
}
