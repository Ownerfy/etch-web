import {useParams, useNavigate, useLocation} from "react-router-dom"
import {queryProfile} from "nostr-tools/nip05"
import {useEffect, useState} from "react"
import ThreadPage from "@/pages/thread"
import ProfilePage from "@/pages/user"

export default function NostrLinkHandler() {
  const {link} = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const cleanLink = link?.includes("web+nostr://")
    ? link.replace(/^web\+nostr:\/\//, "")
    : link

  useEffect(() => {
    if (link?.startsWith("web+nostr://")) {
      navigate(`/${cleanLink}`, {replace: true})
    }
  }, [link, cleanLink, navigate])

  const isProfile = cleanLink?.startsWith("npub") || cleanLink?.startsWith("nprofile")
  const isNote = cleanLink?.startsWith("note") || cleanLink?.startsWith("nevent")

  const [pubkey, setPubkey] = useState<string | null>(null)
  const [loading, setLoading] = useState(!isProfile && !isNote)

  useEffect(() => {
    setLoading(!isProfile && !isNote)
    setPubkey(null)

    if (isProfile || isNote) return
    const query = async () => {
      const maybeNip05 = cleanLink?.includes("@") ? cleanLink : `${cleanLink}@etch.social`
      const profile = await queryProfile(maybeNip05)
      if (profile) {
        setPubkey(profile.pubkey)
      }
      setLoading(false)
    }
    query()
  }, [cleanLink, isProfile, isNote])

  if (pubkey || isProfile) {
    const k = pubkey || cleanLink!
    return <ProfilePage pubKey={k} key={k} />
  } else if (isNote) {
    return <ThreadPage id={cleanLink!} key={location.pathname} />
  } else if (loading) {
    return <ProfilePage pubKey={""} key={pubkey || location.pathname} />
  } else {
    return <div className="p-4">Page /{cleanLink} not found</div>
  }
}
