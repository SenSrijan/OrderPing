export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">OrderPing</h1>
          <p className="text-white/80">WhatsApp automation for your orders</p>
        </div>
        <div className="glass rounded-2xl p-6 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}