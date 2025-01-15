import longFormIcon from "@/assets/long-form-icon.png"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import ReactMarkdown from "react-markdown"
import {useEffect, useState} from "react"

interface LongFormProps {
  event: NDKEvent
  standalone: boolean | undefined
}

function LongForm({event, standalone}: LongFormProps) {
  const [title, setTitle] = useState<string>("")
  const [topics, setTopics] = useState<string>()
  const [textBody, setTextBody] = useState<string>("")
  const [summary, setSummary] = useState<string>("")

  useEffect(() => {
    const title = event.tagValue("title")
    if (title) setTitle(title)

    const hashtags = event.tagValue("t")
    if (hashtags) setTopics(hashtags)

    const textBody = event.content
    setTextBody(textBody)

    const summaryTag = event.tagValue("summary")
    if (summaryTag) setSummary(summaryTag)
  }, [event])

  return (
    <div className="flex flex-col gap-2 px-5">
      <h1 className="flex items-center gap-2 text-lg">
        <img src={longFormIcon} className="opacity-80 w-8 h-8" />
        {title}
      </h1>
      <ReactMarkdown className="prose leading-relaxed tracking-wide text-gray-450">
        {standalone ? textBody : summary || `${textBody.substring(0, 100)}...`}
      </ReactMarkdown>
      {topics && <small className="text-custom-accent">#{topics}</small>}
    </div>
  )
}

export default LongForm
