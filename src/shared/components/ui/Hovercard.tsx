import React from "react"
interface HoverCardProps {
  children: React.ReactNode
  content: React.ReactNode
  onClick?: () => void
}

function HoverCard({children, content, onClick}: HoverCardProps) {
  return (
    <div className="relative inline-block group" onClick={onClick}>
      {children}
      <div className="absolute hidden group-hover:block rounded-md shadow-md z-40">
        {content}
      </div>
    </div>
  )
}

export default HoverCard
