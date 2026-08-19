export function AppSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-ivory-warm">
      <div className="w-full max-w-[1440px] mx-auto flex relative min-h-screen bg-ivory shadow-sm">
        {children}
      </div>
    </div>
  );
}