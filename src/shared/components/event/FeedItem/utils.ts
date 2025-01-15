import {useNavigate} from "react-router-dom"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {nip19} from "nostr-tools"
import {MouseEvent} from "react"

export const TRUNCATE_LENGTH = 300

export const isTextSelected = () => {
  const selection = window.getSelection()
  return selection && selection.toString().length > 0
}

export function onClick(
  e: MouseEvent<HTMLDivElement>,
  event: NDKEvent | undefined,
  repostedEvent: NDKEvent | undefined,
  eventId: string | undefined,
  navigate: ReturnType<typeof useNavigate>
) {
  if (
    event?.kind === 6927 ||
    event?.kind === 30078 ||
    e.target instanceof HTMLAnchorElement ||
    e.target instanceof HTMLImageElement ||
    e.target instanceof HTMLVideoElement ||
    (e.target instanceof HTMLElement && e.target.closest("a")) ||
    (e.target instanceof HTMLElement && e.target.closest("button")) ||
    isTextSelected()
  ) {
    return
  }
  navigate(`/${nip19.noteEncode(repostedEvent?.id || eventId || event!.id)}`)
  e.stopPropagation()
}
