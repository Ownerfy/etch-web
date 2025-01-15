import {NavLink, Route, Routes} from "react-router-dom"
import Widget from "@/shared/components/ui/Widget"
import {useMemo, ReactNode} from "react"
import classNames from "classnames"

import FeedFilters from "../home/feed/components/FeedFilters"
import RightColumn from "@/shared/components/RightColumn"
import Trending from "@/shared/components/feed/Trending"
import useFollows from "@/shared/hooks/useFollows"
import {hasMedia} from "@/shared/components/embed"
import OrganizationsTab from "./OrganizationsTab"
import FollowList from "./components/FollowList"
import socialGraph from "@/utils/socialGraph.ts"
import {getEventReplyingTo} from "@/utils/nostr"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import ProfileHeader from "./ProfileHeader"
import {useLocalState} from "irisdb-hooks"
import {PublicKey} from "irisdb-nostr"
import Gems from "./components/Gems"
import NotesTab from "./NotesTab"
import CodeTab from "./CodeTab"

type Tab = {
  name: string
  path: string
  element: ({
    pubKey,
    showRepliedTo,
    displayFilterFn,
  }: {
    pubKey: string
    showRepliedTo?: boolean
    displayFilterFn?: (e: NDKEvent) => boolean
  }) => ReactNode
  displayFilterFn?: (e: NDKEvent) => boolean
  showRepliedTo?: boolean
}

const tabs: Tab[] = [
  {
    name: "Posts",
    path: "",
    displayFilterFn: (e: NDKEvent) => !getEventReplyingTo(e),
    element: NotesTab,
  },
  {name: "Replies", path: "replies", element: NotesTab, showRepliedTo: true},
  {
    name: "Media",
    path: "media",
    displayFilterFn: (e: NDKEvent) => hasMedia(e),
    element: NotesTab,
  },
]

if (CONFIG.features.git) {
  tabs.push(
    {name: "Code", path: "code", element: CodeTab},
    {name: "Organizations", path: "organizations", element: OrganizationsTab}
  )
}

function UserPage({pubKey}: {pubKey: string}) {
  const pubKeyHex = useMemo(
    () => (pubKey ? new PublicKey(pubKey).toString() : ""),
    [pubKey]
  )
  const [myPubKey] = useLocalState("user/publicKey", "")
  const follows = useFollows(pubKey)
  const filteredFollows = useMemo(() => {
    return follows
      .filter((follow) => socialGraph().getFollowDistance(follow) > 1)
      .sort(() => Math.random() - 0.5) // Randomize order
  }, [follows])

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-1 justify-center">
        <div className="flex flex-1 flex-col items-center justify-center h-full">
          <ProfileHeader pubKey={pubKey} key={pubKey} />
          <div className="flex w-full flex-1 mt-2 flex flex-col gap-4">
            <div className="px-4 flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  end={tab.path === ""}
                  preventScrollReset={true}
                  className={({isActive}) =>
                    classNames("btn btn-sm", isActive ? "btn-primary" : "btn-neutral")
                  }
                >
                  {tab.name}
                </NavLink>
              ))}
            </div>
            <Routes>
              {tabs.map((tab) => (
                <Route
                  key={tab.path}
                  path={tab.path}
                  element={
                    <tab.element
                      showRepliedTo={tab.showRepliedTo}
                      pubKey={pubKeyHex}
                      displayFilterFn={tab.displayFilterFn}
                    />
                  }
                />
              ))}
            </Routes>
          </div>
        </div>
      </div>
      <RightColumn>
        {() => (
          <>
            {CONFIG.rightColumnFilters && <FeedFilters />}
            {filteredFollows.length > 0 && (
              <Widget title="Follows">
                <FollowList follows={filteredFollows} />
              </Widget>
            )}
            {pubKeyHex === myPubKey && (
              <Widget title="Trending posts">
                <Trending />
              </Widget>
            )}
            {pubKey && (
              <div className="h-auto overflow-y-auto scrollbar-hide">
                <Gems pubKey={pubKey} />
              </div>
            )}
          </>
        )}
      </RightColumn>
    </div>
  )
}

export default UserPage
