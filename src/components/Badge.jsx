export default function Badge({ children, variant = 'default', className = '' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-700',
    blue: 'bg-protender-blue/10 text-protender-blue',
  }
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>
}
