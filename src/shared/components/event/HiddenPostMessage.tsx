interface HiddenPostMessageProps {
  toggleViewPost: () => void
}

function HiddenPostMessage({toggleViewPost}: HiddenPostMessageProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-error">This user is muted.</h3>
      <p>Would you like to view their post?</p>
      <button className="btn btn-primary" onClick={toggleViewPost}>
        View
      </button>
    </div>
  )
}

export default HiddenPostMessage
