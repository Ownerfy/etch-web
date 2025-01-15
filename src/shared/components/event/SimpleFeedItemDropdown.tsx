import MoreVertIcon from "@mui/icons-material/MoreVert"

type FeedItemDropdownProps = {
  eventId: string
}

function SimpleFeedItemDropdown({eventId}: FeedItemDropdownProps) {
  const handleCopyNoteID = () => {
    navigator.clipboard.writeText(eventId)
  }

  return (
    <div className="" onClick={(e) => e.stopPropagation()}>
      <div className="dropdown">
        <div tabIndex={0} role="button" className="p-2 text-base-content/50">
          <MoreVertIcon className="h-6 w-6 cursor-pointer" />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button onClick={handleCopyNoteID}>Copy Event ID</button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SimpleFeedItemDropdown
