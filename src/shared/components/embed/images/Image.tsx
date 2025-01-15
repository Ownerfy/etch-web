import Embed, {EmbedProps} from "../index.ts"
import Carousel from "./Carousel.tsx"

const imageEmbed: Embed = {
  settingsKey: "imageEmbed",
  regex:
    /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s#]*)?(?:#[^\s]*)?(?:\s+https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif)(?:\?[^\s#]*)?(?:#[^\s]*)?)*)/gi,
  component: ({match, event}: EmbedProps) => {
    const urls = match.trim().split(/\s+/)
    return <Carousel images={urls} event={event} />
  },
}

export default imageEmbed
