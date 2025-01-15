import RefreshIcon from "@mui/icons-material/Refresh"

const LoadingComponent = () => {
  return (
    <div className="Loading-container">
      <RefreshIcon className="Loading-icon" />
      <p>Processing...</p>
    </div>
  )
}

export default LoadingComponent
