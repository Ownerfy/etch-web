import Embed from "./index.ts"

const TorrentEmbed: Embed = {
  regex:
    /(lightning:[\w.-]+@[\w.-]+|lightning:\w+\?amount=\d+|(?:lightning:)?(?:lnurl|lnbc)[\da-z0-9]+)/gi,
  component: ({match}) => {
    if (!match.startsWith("lightning:")) {
      match = `lightning:${match}`
    }
    // todo: parse invoice and show amount
    return <a href={match}>⚡ Pay with lightning</a>
  },
}

export default TorrentEmbed
