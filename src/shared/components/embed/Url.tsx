import Embed from "./index.ts"

const Url: Embed = {
  regex: /(https?:\/\/[^\s,\\.]+(?:\.[^\s,.]+)*)/g,
  component: ({match}) => {
    return (
      <a className="link link-info" target="_blank" href={match} rel="noreferrer">
        {match.replace(/^https?:\/\//, "").replace(/\/$/, "")}
      </a>
    )
  },
}

export default Url
