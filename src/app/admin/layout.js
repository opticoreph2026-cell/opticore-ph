export const metadata = {
  title: 'Admin Command — OptiCore PH',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-1000 text-text-primary font-body selection:bg-brand-500/30">
      {/* Admin specific shell elements could go here if needed */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
