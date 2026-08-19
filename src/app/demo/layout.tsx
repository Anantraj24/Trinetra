export const metadata = {
  title: 'SIH Guided Demo | TRINETRA',
  description: 'Deterministic step-by-step SIH jury demonstration workflow.',
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-taupe-dark flex flex-col antialiased selection:bg-forest selection:text-white">
      {children}
    </div>
  );
}
