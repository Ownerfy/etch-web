import HomeFeedEvents from "@/pages/home/feed/components/HomeFeedEvents.tsx"
import FeedFilters from "@/pages/home/feed/components/FeedFilters.tsx"
import RightColumn from "@/shared/components/RightColumn.tsx"
import Trending from "@/shared/components/feed/Trending.tsx"
import Widget from "@/shared/components/ui/Widget.tsx"

function Index() {
  return (
    <section className="flex flex-1 w-full justify-center">
      <div className="flex-1">
        <HomeFeedEvents />
      </div>
      <RightColumn>
        {() => (
          <>
            {CONFIG.rightColumnFilters && <FeedFilters />}
            <Widget title="Trending posts">
              <Trending />
            </Widget>
            <Widget title="Popular hashtags">
              <Trending contentType="hashtags" />
            </Widget>
          </>
        )}
      </RightColumn>
    </section>
  )
}

export default Index
