export default function SummaryBox({ title, children, variant = 'default', className = '' }) {
  const variants = {
    default: 'border-gray-200 bg-white',
    success: 'border-green-200 bg-green-50/80',
    warning: 'border-amber-200 bg-amber-50/80',
    error: 'border-red-200 bg-red-50/80',
  }
  const v = variants[variant] || variants.default
  return (
    <div className={`rounded-xl border p-4 ${v} ${className}`}>
      {title && <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>}
      {children}
    </div>
  )
}
