export function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="card p-8 text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-brand-gray">This section will be implemented in {phase}.</p>
    </div>
  );
}
