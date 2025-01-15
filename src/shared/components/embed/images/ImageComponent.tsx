import {useState, MouseEvent} from "react"
import ProxyImg from "../../ProxyImg"
import classNames from "classnames"

interface ImageComponentProps {
  match: string
  index: number
  onClickImage: () => void
  blur?: boolean
}

const ImageComponent = ({match, index, onClickImage, blur}: ImageComponentProps) => {
  const [hasError, setHasError] = useState(false)

  const onClick = (event: MouseEvent) => {
    event.stopPropagation()
    onClickImage()
  }

  return (
    <div
      key={match + index}
      className="flex justify-center items-center md:justify-start h-96 max-h-screen my-2"
    >
      {hasError ? (
        <div className="my-2 text-sm break-all">{match}</div>
      ) : (
        <ProxyImg
          width={600}
          onError={() => setHasError(true)}
          onClick={onClick}
          className={classNames("my-2 rounded max-h-96 max-w-full cursor-pointer", {
            "blur-md": blur,
          })}
          src={match}
        />
      )}
    </div>
  )
}

export default ImageComponent
