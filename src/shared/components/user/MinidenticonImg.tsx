import {ImgHTMLAttributes, useMemo} from "react"
import {minidenticon} from "minidenticons"

type Props = {
  username: string
  saturation?: number
  lightness?: number
} & ImgHTMLAttributes<HTMLImageElement>

const MinidenticonImg = ({username, saturation, lightness, ...props}: Props) => {
  const svgURI = useMemo(
    () =>
      "data:image/svg+xml;utf8," +
      encodeURIComponent(minidenticon(username, saturation, lightness)),
    [username, saturation, lightness]
  )
  return <img src={svgURI} alt={username} {...props} />
}

export default MinidenticonImg
