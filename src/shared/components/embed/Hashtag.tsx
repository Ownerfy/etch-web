import {Link} from "react-router-dom"

import Embed from "./index.ts"

const Hashtag: Embed = {
  regex: /(#\w+)/g,
  component: ({match}) => {
    return (
      <Link to={`/search/${encodeURIComponent(match)}`} className="link link-info">
        {match}
      </Link>
    )
  },
}

export default Hashtag
