import {useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import classNames from "classnames"
import {nip19} from "nostr-tools"

import {searchIndex, SearchResult} from "@/utils/socialGraph"
import {UserRow} from "@/shared/components/user/UserRow"
import {Check} from "@mui/icons-material"
import Icon from "../Icons/Icon"
import {ndk} from "irisdb-nostr"

const NOSTR_REGEX = /(npub|note|nevent)1[a-zA-Z0-9]{58,300}/gi
const HEX_REGEX = /[0-9a-fA-F]{64}/gi
const NIP05_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_RESULTS = 5

interface CustomSearchResult extends SearchResult {
  query?: string
}

// this component is used for global search in the Header.tsx
// and for searching assignees in Issues & PRs
interface SearchBoxProps {
  onSelect?: (pubKey: string) => void
  redirect?: boolean
  assignees?: string[]
  setAssignees?: (assignees: string) => void
  className?: string
  searchNotes?: boolean
}

function SearchBox({
  redirect = true,
  assignees = [],
  setAssignees,
  onSelect,
  className,
  searchNotes = false,
}: SearchBoxProps) {
  const [searchResults, setSearchResults] = useState<CustomSearchResult[]>([])
  const [activeResult, setActiveResult] = useState<number>(0)
  const [value, setValue] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  onSelect =
    onSelect ||
    ((pubKey: string) => {
      try {
        navigate(`/${nip19.npubEncode(pubKey)}`)
      } catch (error) {
        console.error("Error encoding pubkey:", error)
        navigate(`/${pubKey}`)
      }
    })

  useEffect(() => {
    const v = value.trim()
    if (v) {
      if (v.match(NOSTR_REGEX)) {
        let result
        try {
          result = nip19.decode(v)
          if (result.type === "npub") {
            onSelect(result.data)
          } else {
            navigate(`/${v}`)
          }
        } catch (e) {
          navigate(`/${v}`)
        }
        setValue("")
        return
      } else if (v.match(HEX_REGEX)) {
        onSelect(v)
        setValue("")
        return
      } else if (v.match(NIP05_REGEX)) {
        ndk()
          .getUserFromNip05(v)
          .then((user) => {
            if (user) {
              onSelect(user.pubkey)
              setValue("")
            }
          })
      }

      const results = searchIndex.search(value.trim(), {limit: MAX_RESULTS * 2})
      // const resultsWithAdjustedScores = results.map((result) => {
      //   const followDistance = Math.max(
      //     socialGraph().getFollowDistance(result.item.pubKey),
      //     1
      //   )
      //   const followedByFriends = socialGraph().followedByFriends(result.item.pubKey).size
      //   const adjustedScore =
      //     result.score! * Math.pow(followDistance, 3) * Math.pow(0.9, followedByFriends)

      //   /*
      //   console.log(
      //     `Result: ${result.item.name}, Score: ${result.score}, Follow Distance: ${followDistance}, Followed By Friends: ${followedByFriends}, Adjusted Score: ${adjustedScore}`
      //   )
      //   */

      //   return {...result, adjustedScore}
      // })

      // resultsWithAdjustedScores.sort((a, b) => a.adjustedScore - b.adjustedScore)

      if (!redirect) {
        setActiveResult(1)
      } else {
        setActiveResult(0)
      }
      setSearchResults([
        ...(searchNotes
          ? [{pubKey: "search-notes", name: `search notes: ${v}`, query: v}]
          : []),
        ...results.map((result) => result.item),
      ])
    } else {
      setSearchResults([])
    }
  }, [value, navigate, searchNotes])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!value) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveResult((prev) => (prev + 1) % MAX_RESULTS)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveResult((prev) => (prev - 1 + MAX_RESULTS) % MAX_RESULTS)
      } else if (e.key === "Escape") {
        setValue("")
        setSearchResults([])
      } else if (e.key === "Enter" && searchResults.length > 0) {
        const activeItem = searchResults[activeResult]
        if (activeItem.pubKey === "search-notes" && activeItem.query && redirect) {
          navigate(`/search/${activeItem.query}`)
        } else {
          if (!redirect && setAssignees) {
            setAssignees(activeItem.pubKey)
          } else {
            onSelect(activeItem.pubKey)
          }
        }
        setValue("")
        setSearchResults([])
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchResults, activeResult, navigate])

  // autofocus the input field when searching for Issue/PR assignees
  useEffect(() => {
    if (!redirect && inputRef.current) {
      inputRef.current.focus()
    }
  }, [redirect])

  const handleSearchResultClick = (pubKey: string, query?: string) => {
    if (redirect) {
      setValue("")
      setSearchResults([])
      if (pubKey === "search-notes" && query) {
        navigate(`/search/${query}`)
      } else {
        onSelect(pubKey)
      }
    } else if (setAssignees !== undefined) {
      setAssignees(pubKey)
    }
  }

  return (
    <div className={"dropdown dropdown-open"}>
      <label className={classNames("input flex items-center gap-2", className)}>
        <input
          type="text"
          className="grow"
          placeholder="Search"
          value={value}
          ref={inputRef}
          onChange={(e) => setValue(e.target.value)}
        />
        <Icon name="search-outline" className="text-neutral-content/60" />
      </label>
      {searchResults.length > 0 && (
        <ul className="dropdown-content menu shadow bg-base-100 rounded-box z-10 w-full">
          {searchResults.slice(0, MAX_RESULTS).map((result, index) => (
            <li
              key={result.pubKey}
              className={classNames("cursor-pointer rounded-md", {
                "bg-primary text-primary-content": index === activeResult,
                "hover:bg-primary/50": index !== activeResult,
              })}
              onClick={() => handleSearchResultClick(result.pubKey, result.query)}
            >
              {result.pubKey === "search-notes" && searchNotes ? (
                <div className={classNames("inline", {hidden: !redirect})}>
                  Search notes: <span className="font-bold">{result.query}</span>
                </div>
              ) : (
                <div className="flex gap-1">
                  <UserRow pubKey={result.pubKey} linkToProfile={redirect} />
                  {!redirect &&
                    assignees &&
                    assignees.length > 0 &&
                    assignees.includes(result.pubKey) && (
                      <Check className="text-purple-500" />
                    )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!searchResults.length &&
        assignees &&
        assignees.length > 0 &&
        location.pathname.split("/").pop() !== "settings" && (
          <ul className="dropdown-content menu shadow bg-base-100 rounded-box z-10 w-full">
            {assignees.map((pubKey, index) => (
              <li
                key={index}
                className={classNames("cursor-pointer rounded-md", {
                  "bg-primary text-primary-content": index === activeResult,
                  "hover:bg-primary/50": index !== activeResult,
                })}
                onClick={() => handleSearchResultClick(pubKey)}
              >
                <div className="flex gap-1">
                  <UserRow pubKey={pubKey} linkToProfile={redirect} />
                  <Check className="text-purple-500" />
                </div>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}

export default SearchBox
