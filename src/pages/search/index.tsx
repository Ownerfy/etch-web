import {useMemo, useState, useEffect, FormEvent, useCallback} from "react"
import MiddleHeader from "@/shared/components/header/MiddleHeader"
import BskyTrending from "@/shared/components/feed/BskyTrending"
import RightColumn from "@/shared/components/RightColumn.tsx"
import Trending from "@/shared/components/feed/Trending.tsx"
import SearchBox from "@/shared/components/ui/SearchBox"
import {useParams, useNavigate} from "react-router-dom"
import {NDKFilter, NDKEvent} from "@nostr-dev-kit/ndk"
import Feed from "@/shared/components/feed/Feed.tsx"
import Widget from "@/shared/components/ui/Widget"
import {Helmet} from "react-helmet"
function SearchPage() {
  const {query} = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState(query || "")
  const [activeTab, setActiveTab] = useState<"people" | "posts">(
    query ? "posts" : "people"
  )

  useEffect(() => {
    setSearchTerm(query?.toLowerCase() || "")
  }, [query])

  const filters: NDKFilter = useMemo(
    () => ({
      kinds: [1],
      search: query,
    }),
    [query]
  )

  const displayFilterFn = useCallback(
    (event: NDKEvent) => event.content.toLowerCase().includes(searchTerm),
    [searchTerm]
  )

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm !== query) {
      navigate(`/search/${searchTerm}`)
    }
  }

  return (
    <div className="flex flex-row">
      <div key={query} className="flex flex-col items-center flex-1">
        <MiddleHeader title={query ? `Search: "${query}"` : "Search"} />
        <div className="p-2 flex-1 w-full max-w-screen-lg flex flex-col gap-4">
          {activeTab === "people" ? (
            <SearchBox searchNotes={true} />
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="input input-bordered w-full"
              />
              <button type="submit" className="btn btn-primary ml-2">
                Search
              </button>
            </form>
          )}
          <div className="px-2 flex gap-2 overflow-x-auto">
            <button
              className={`btn btn-sm ${activeTab === "people" ? "btn-primary" : "btn-neutral"}`}
              onClick={() => setActiveTab("people")}
            >
              People
            </button>
            <button
              className={`btn btn-sm ${activeTab === "posts" ? "btn-primary" : "btn-neutral"}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
          </div>
          {query && (
            <Feed
              filters={filters}
              displayFilterFn={displayFilterFn}
              showRepliedTo={false}
            />
          )}
          {!query && (
            <div className="mt-4">
              <Trending small={false} />
            </div>
          )}
        </div>
        <Helmet>
          <title>{query ? `Search: ${query}` : `Search`} / Etch</title>
        </Helmet>
      </div>
      <RightColumn>
        {() => (
          <>
            <BskyTrending />
            <Widget title="Nostr trending posts">
              <Trending />
            </Widget>
            <Widget title="Nostr popular hashtags">
              <Trending contentType="hashtags" />
            </Widget>
          </>
        )}
      </RightColumn>
    </div>
  )
}

export default SearchPage
