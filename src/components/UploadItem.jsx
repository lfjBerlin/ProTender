import { Upload, FileText, X } from 'lucide-react'

const ACCEPT = '.pdf,.png,.jpg,.jpeg'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadItem({ label, hint, required, file, onFileChange, onRemove }) {
  const hasFile = file && file.name

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <div className="flex items-center gap-3">
        <label className="flex-1 min-w-0 cursor-pointer">
          <input
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFileChange(f)
            }}
          />
          {hasFile ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-protender-blue/30 transition-colors">
              <FileText className="w-5 h-5 text-protender-blue flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatSize(file.size)} · <span className="text-green-600 font-medium">hochgeladen</span>
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onRemove()
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Entfernen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-protender-blue/50 bg-gray-50/50 hover:bg-protender-blue/5 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">PDF, PNG oder JPG hochladen</span>
            </div>
          )}
        </label>
      </div>
    </div>
  )
}
