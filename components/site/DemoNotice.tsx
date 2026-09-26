export function DemoNotice({ connected }: { connected: boolean }) {
  return (
    <div className="bg-gold-100 text-center text-[0.8125rem] text-navy-900">
      <p className="container-page py-1.5">
        {connected
          ? "Preview: sample stories are shown until the newsroom publishes its first story."
          : "Preview mode: showing sample stories. Connect the Supabase database to publish real content."}
      </p>
    </div>
  );
}
