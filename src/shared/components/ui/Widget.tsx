import React from "react"

interface WidgetProps {
  title: string
  children: React.ReactNode
}

function Widget({title, children}: WidgetProps) {
  return (
    <div className="bg-base-100 rounded-lg">
      <h2 className="font-bold text-xs text-base-content/50 uppercase tracking-wide px-4 py-3">
        {title}
      </h2>
      <div className="max-h-96 overflow-y-auto px-4 py-1">{children}</div>
    </div>
  )
}

export default Widget
