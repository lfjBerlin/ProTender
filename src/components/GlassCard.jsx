export default function GlassCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-white/30 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200/60 bg-white/50">
          {Icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-protender-blue/10 text-protender-blue">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h3 className="text-lg font-bold text-protender-blue">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
