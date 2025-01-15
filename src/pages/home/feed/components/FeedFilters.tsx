import {
  AdjustOutlined,
  ArrowDropDown,
  ArrowDropUp,
  Bolt,
  ChangeCircle,
  Code,
  Diamond,
  Gif,
  Headphones,
  People,
  Photo,
  PhotoCamera,
  Save,
  StarBorder,
  VideoCameraBack,
} from "@mui/icons-material"
import {GitPullRequestIcon, RepoForkedIcon} from "@primer/octicons-react"
import {ReactNode, useState} from "react"

import highlightsIcon from "@/assets/highlights-icon.png"
import longFormIcon from "@/assets/long-form-icon.png"
import quotesIcon from "@/assets/quotes-icon.png"
import reelsIcon from "@/assets/reels-icon.png"
import noteIcon from "@/assets/note-icon.png"

import FeedToggle from "../../../../shared/components/feed/FeedToggle.tsx"
import Widget from "@/shared/components/ui/Widget.tsx"
import {defaultFeedFilter} from "@/utils/nostr.ts"
import {useLocalState} from "irisdb-hooks"

interface Toggle {
  title: string
  iconComponent: ReactNode
}

const codeToggles: Toggle[] = [
  {title: "Repos", iconComponent: <Save className="w-8 h-8" />},
  {title: "Issues", iconComponent: <AdjustOutlined className="w-8 h-8" />},
  {title: "Forks", iconComponent: <RepoForkedIcon size={24} className="w-8 h-8" />},
  {title: "Stars", iconComponent: <StarBorder className="w-8 h-8" />},
  {title: "PRs", iconComponent: <GitPullRequestIcon size={24} className="w-8 h-8" />},
]

const socialToggles: Toggle[] = [
  {title: "Notes", iconComponent: <img src={noteIcon} className="w-8 h-8" />},
  {
    title: "Reposts",
    iconComponent: <ChangeCircle fontSize="large" className="w-8 h-8" />,
  },
  {title: "Rezaps", iconComponent: <Bolt fontSize="large" className="w-8 h-8" />},
  {title: "Quotes", iconComponent: <img src={quotesIcon} className="w-8 h-8" />},
  {title: "Long-form", iconComponent: <img src={longFormIcon} className="w-8 h-8" />},
  {title: "Highlights", iconComponent: <img src={highlightsIcon} className="w-8 h-8" />},
  {title: "Gems", iconComponent: <Diamond className="w-8 h-8" />},
]

const mediaToggles: Toggle[] = [
  {title: "Text-only", iconComponent: <img src={noteIcon} className="w-8 h-8" />},
  {title: "Images", iconComponent: <Photo className="w-8 h-8" />},
  {title: "Videos", iconComponent: <VideoCameraBack className="w-8 h-8" />},
  {title: "GIFs", iconComponent: <Gif className="w-8 h-8" />},
  {title: "Audio", iconComponent: <Headphones className="w-8 h-8" />},
  {title: "Shorts", iconComponent: <img src={reelsIcon} className="w-8 h-8" />},
]

function FeedFilters() {
  const [feedFilter, setFeedFilter] = useLocalState("user/feedFilter", defaultFeedFilter)

  const [activeSection, setActiveSection] = useState<string | null>("Social")

  const renderFeedToggles = (toggles: Toggle[]) =>
    toggles.map((toggle) => (
      <FeedToggle
        key={toggle.title}
        title={toggle.title}
        iconComponent={toggle.iconComponent}
        filter={feedFilter}
        setFilter={setFeedFilter}
      />
    ))

  const handleSectionToggle = (section: string) =>
    setActiveSection(activeSection === section ? null : section)

  return (
    <Widget title="Filters">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <p
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleSectionToggle("Social")}
          >
            <People /> Social{" "}
            {activeSection === "Social" ? <ArrowDropDown /> : <ArrowDropUp />}
          </p>
          <div
            className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
              activeSection === "Social"
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {renderFeedToggles(socialToggles)}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleSectionToggle("Media")}
          >
            <PhotoCamera /> Media{" "}
            {activeSection === "Media" ? <ArrowDropDown /> : <ArrowDropUp />}
          </p>
          <div
            className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
              activeSection === "Media"
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {renderFeedToggles(mediaToggles)}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleSectionToggle("Code")}
          >
            <Code /> Code {activeSection === "Code" ? <ArrowDropDown /> : <ArrowDropUp />}
          </p>
          <div
            className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
              activeSection === "Code"
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {renderFeedToggles(codeToggles)}
          </div>
        </div>
      </div>
    </Widget>
  )
}

export default FeedFilters
