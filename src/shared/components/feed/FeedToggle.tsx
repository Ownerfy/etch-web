import {ReactNode, useMemo} from "react"
import {JsonValue} from "irisdb"

interface FeedToggleProps {
  title: string
  iconComponent: ReactNode
  filter: (string | number)[]
  setFilter: (value: JsonValue) => void
  kinds?: (number | string)[]
}

function FeedToggle({title, iconComponent, filter, setFilter, kinds}: FeedToggleProps) {
  const isToggled = useMemo(() => filter.includes(title.toLowerCase()), [title, filter])

  const handleToggleChange = () => {
    let newFilter: (number | string)[]

    if (filter.includes(title.toLowerCase())) {
      newFilter = filter.filter(
        (k: number | string) => k !== title.toLowerCase() && !kinds?.includes(k)
      )
    } else {
      newFilter = [...filter, title.toLowerCase()]
    }
    setFilter(newFilter)
  }

  return (
    <div className="flex items-center cursor-pointer flex-row gap-3">
      <div className="w-8 h-8 flex items-center justify-center">{iconComponent}</div>
      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={isToggled}
        onClick={handleToggleChange}
      />
      <div>{title}</div>
    </div>
  )
}

export default FeedToggle
