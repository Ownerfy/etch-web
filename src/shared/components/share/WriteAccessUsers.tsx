import {PublicKey, publicState} from "irisdb-nostr"
import {Link, useLocation} from "react-router-dom"
import {RiDeleteBinLine} from "@remixicon/react"
import {useLocalState} from "irisdb-hooks"
import {nip19} from "nostr-tools"
import {useMemo} from "react"

import {FollowUserForm} from "@/shared/components/share/FollowUserForm"
import CopyButton from "@/shared/components/button/CopyButton.tsx"
import {UserRow} from "@/shared/components/user/UserRow"
import Show from "@/shared/components/Show"

type WriteAccessUsersProps = {
  owner: string
  isMine: boolean
  file: string
  authors: string[]
}

export const WriteAccessUsers = ({
  owner,
  isMine,
  file,
  authors,
}: WriteAccessUsersProps) => {
  const [myPubKey] = useLocalState("user/publicKey", "")
  const userHex = useMemo(
    () => (owner === "follows" ? "" : new PublicKey(owner).toString()),
    [owner, myPubKey]
  )
  const location = useLocation()
  const basePath = location.pathname.split("/")[1]

  if (owner === "follows") {
    // todo: people search & follow here
    return (
      <div>
        Showing writes by you and <b>{authors.length - 1}</b> users followed by you. Find
        and follow people on{" "}
        <a
          href="https://etch.social"
          className="link link-accent"
          target="_blank"
          rel="noreferrer"
        >
          Etch
        </a>
        , or add here:
        <div className="my-2">
          <FollowUserForm />
        </div>
      </div>
    )
  }

  return (
    <>
      <Link to={`/${basePath}?user=${owner}`}>
        <UserRow pubKey={owner!} description="Owner" />
      </Link>
      <Show when={!!myPubKey && !isMine}>
        <span className="text-sm">
          Request write access by giving your public key to the owner:
        </span>
        <CopyButton
          copyStr={nip19.npubEncode(myPubKey)}
          text="Copy public key"
          className="btn btn-outline"
        />
      </Show>
      {authors
        .filter((pubKey) => pubKey !== userHex)
        .map((pubKey) => (
          <div className="flex flex-row gap-2 items-center" key={pubKey}>
            <div className="flex-1">
              <Link
                to={{
                  pathname: basePath,
                  search: `?user=${new PublicKey(pubKey).toBech32("npub")}`,
                }}
              >
                <UserRow pubKey={pubKey} description="Write access" />
              </Link>
            </div>
            <Show when={isMine}>
              <button
                className="btn btn-circle btn-sm btn-outline"
                type="button"
                onClick={() => {
                  publicState(myPubKey).get(`${file}/writers/${pubKey}`).put(false)
                }}
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </Show>
          </div>
        ))}
    </>
  )
}
