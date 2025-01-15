import RefreshIcon from "@mui/icons-material/Refresh"

const Loading = () => {
  return (
    <div className="backdrop">
      <div className="Loading-container">
        <RefreshIcon className="Loading-icon" />
        <p>Processing...</p>
      </div>
    </div>
  )
}

export default Loading
