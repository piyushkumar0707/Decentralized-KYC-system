"use client"

const PrivacyToggle = ({ attribute, isPublic, onToggle, disabled = false }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 capitalize">{attribute}</h3>
        <p className="text-xs text-gray-500 mt-1">{isPublic ? "Visible to verifiers" : "Private and encrypted"}</p>
      </div>

      <button
        onClick={() => onToggle(attribute, !isPublic)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isPublic ? "bg-blue-600" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            isPublic ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>

      <div className="ml-3 min-w-0 flex-1">
        <span className={`text-xs font-medium ${isPublic ? "text-blue-600" : "text-gray-500"}`}>
          {isPublic ? "Public" : "Private"}
        </span>
      </div>
    </div>
  )
}

export default PrivacyToggle

