import {NDKEvent, NDKFilter} from "@nostr-dev-kit/ndk"
import socialGraph from "@/utils/socialGraph"
import {ndk} from "irisdb-nostr"

export interface PushNotifications {
  endpoint: string
  p256dh: string
  auth: string
}

export interface Subscription {
  webhooks: any[]
  web_push_subscriptions: PushNotifications[]
  filter: {
    ids?: string[]
    authors?: string[]
    kinds: number[]
    search?: string
    "#p"?: string[]
  }
  subscriber: string
}

export interface SubscriptionResponse {
  [key: string]: Subscription
}

/**
 * Can be used for web push notifications
 */
export default class SnortApi {
  #url: string

  constructor(url?: string) {
    this.#url = new URL(url ?? CONFIG.defaultSettings.notificationServer).toString()
  }

  twitterImport(username: string) {
    return this.#getJson<Array<string>>(
      `api/v1/twitter/follows-for-nostr?username=${encodeURIComponent(username)}`
    )
  }

  getPushNotificationInfo() {
    return this.#getJson<{vapid_public_key: string}>("info")
  }

  registerPushNotifications(sub: PushNotifications, filter: NDKFilter) {
    return this.#getJsonAuthd<void>(`subscriptions`, "POST", {
      web_push_subscriptions: [sub],
      webhooks: [],
      filter,
    })
  }

  getSubscriptions() {
    return this.#getJsonAuthd<SubscriptionResponse>("subscriptions")
  }

  async #getJsonAuthd<T>(
    path: string,
    method?: "GET" | string,
    body?: object,
    headers?: {[key: string]: string}
  ): Promise<T> {
    const event = new NDKEvent(ndk(), {
      kind: 27235, // http authentication
      tags: [
        ["url", `${this.#url}${path}`],
        ["method", method ?? "GET"],
      ],
      content: "",
      created_at: Math.floor(Date.now() / 1000),
      pubkey: [...socialGraph().getUsersByFollowDistance(0)][0],
    })
    await event.sign()
    const nostrEvent = await event.toNostrEvent()

    // Ensure the event is encoded correctly
    const encodedEvent = btoa(JSON.stringify(nostrEvent))

    return this.#getJson<T>(path, method, body, {
      ...headers,
      authorization: `Nostr ${encodedEvent}`,
    })
  }

  async #getJson<T>(
    path: string,
    method?: "GET" | string,
    body?: object,
    headers?: {[key: string]: string}
  ): Promise<T> {
    const rsp = await fetch(`${this.#url}${path}`, {
      method: method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        accept: "application/json",
        ...(body ? {"content-type": "application/json"} : {}),
        ...headers,
      },
    })

    if (rsp.ok) {
      const text = (await rsp.text()) as string | null
      if ((text?.length ?? 0) > 0) {
        const obj = JSON.parse(text!)
        if (typeof obj === "object" && "error" in obj) {
          throw new Error(obj.error, obj.code)
        }
        return obj as T
      } else {
        return {} as T
      }
    } else {
      throw new Error("Invalid response")
    }
  }

  updateSubscription(id: string, subscription: Partial<Subscription>) {
    return this.#getJsonAuthd<void>(`subscriptions/${id}`, "POST", subscription)
  }

  createSubscription(filter: Subscription["filter"]) {
    return this.#getJsonAuthd<{id: string; status: string}>("subscriptions", "POST", {
      webhooks: [],
      web_push_subscriptions: [],
      filter,
    })
  }
}

export function trackEvent(
  event: string,
  props?: Record<string, string | boolean>,
  e?: {destination?: {url: string}}
) {
  if (!import.meta.env.DEV && CONFIG.features.analytics) {
    fetch("https://pa.v0l.io/api/event", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        d: CONFIG.hostname,
        n: event,
        r: document.referrer === window.location.href ? null : document.referrer,
        p: props,
        u:
          e?.destination?.url ??
          `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
      }),
    })
  }
}
