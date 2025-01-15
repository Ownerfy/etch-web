import SmallImageComponent from "./SmallImageComponent"
import Embed from "../index"

const SmallImage: Embed = {
  regex:
    /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s#]*)?(?:#[^\s]*)?(?:\s+https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s#]*)?(?:#[^\s]*)?)*)/gi,
  settingsKey: "enableSmallImage",
  component: ({match, event}) => <SmallImageComponent match={match} event={event} />,
}

export default SmallImage
