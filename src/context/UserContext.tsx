import {createContext, Dispatch, ReactNode, SetStateAction, useState} from "react"
import {useLocalState} from "irisdb-hooks"
import PropTypes from "prop-types"
import {JsonValue} from "irisdb"

type UserContextProps = {
  children: ReactNode
}

type Profile = {
  name?: string
  display_name?: string
  displayName?: string
  picture?: string
  banner?: string
  website?: string
  about?: string
  nip05?: string
  lud16?: string
}

type SetPubkeyFunction = ReturnType<typeof useLocalState>[1]

interface UserContextPayload {
  pubkey: JsonValue
  setPubkey: SetPubkeyFunction
  myProfile: Profile
  setMyProfile: Dispatch<SetStateAction<Profile>> | Dispatch<SetStateAction<undefined>>
  published: boolean
  setPublished: Dispatch<SetStateAction<boolean>>
  follows: string[]
  setFollows: Dispatch<SetStateAction<string[]>>
  contacts: string[]
  setContacts: Dispatch<SetStateAction<string[]>>
  deleting: string
  setDeleting: Dispatch<SetStateAction<string>>
  mutedList: string[]
  setMutedList: Dispatch<SetStateAction<string[]>>
  displayWallet: boolean
  setDisplayWallet: Dispatch<SetStateAction<boolean>>
  publishingError: boolean
  setPublishingError: Dispatch<SetStateAction<boolean>>
  zapRefresh: boolean
  setZapRefresh: Dispatch<SetStateAction<boolean>>
}

export const UserContext = createContext<UserContextPayload>({
  pubkey: undefined,
  setPubkey: () => {},
  myProfile: {},
  setMyProfile: () => {},
  published: false,
  setPublished: () => {},
  follows: [],
  setFollows: () => {},
  contacts: [],
  setContacts: () => {},
  deleting: "",
  setDeleting: () => {},
  mutedList: [],
  setMutedList: () => {},
  displayWallet: false,
  setDisplayWallet: () => {},
  publishingError: false,
  setPublishingError: () => {},
  zapRefresh: false,
  setZapRefresh: () => {},
})

export function UserProvider({children}: UserContextProps) {
  const [pubkey, setPubkey] = useLocalState("user/publicKey", "")
  const [myProfile, setMyProfile] = useState<Profile>({})
  const [published, setPublished] = useState(false)

  const cachedFollows = localStorage.getItem("follows")
  const [follows, setFollows] = useState(cachedFollows ? JSON.parse(cachedFollows) : [])
  const [contacts, setContacts] = useState<string[]>([])
  // should contain the id of the event requested for deletion
  const [deleting, setDeleting] = useState("")
  const [mutedList, setMutedList] = useState<string[]>([])
  const [displayWallet, setDisplayWallet] = useState(false)
  const [publishingError, setPublishingError] = useState(false)
  // used for refresh / recalculation signaling after zapping
  const [zapRefresh, setZapRefresh] = useState(false)

  const userPayload = {
    pubkey,
    setPubkey,
    myProfile,
    setMyProfile,
    published,
    setPublished,
    follows,
    setFollows,
    contacts,
    setContacts,
    deleting,
    setDeleting,
    mutedList,
    setMutedList,
    displayWallet,
    setDisplayWallet,
    publishingError,
    setPublishingError,
    zapRefresh,
    setZapRefresh,
  }

  return <UserContext.Provider value={userPayload}>{children}</UserContext.Provider>
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
