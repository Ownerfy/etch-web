import {createBrowserRouter, createRoutesFromElements, Route} from "react-router-dom"

import NostrLinkHandler from "@/pages/NostrLinkHandler.tsx"
import Notifications from "./notifications/Notifications"
import {PrivacyPolicy} from "@/pages/PrivacyPolicy"
import Explorer from "@/pages/explorer/Explorer"
import Layout from "@/shared/components/Layout"
import WalletPage from "./wallet/WalletPage"
import {Page404} from "@/pages/Page404.tsx"
import SettingsPage from "@/pages/settings"
import MessagesPage from "@/pages/messages"
import SearchPage from "@/pages/search"
import Install from "@/pages/Install"
import HomePage from "@/pages/home"
import {TOS} from "@/pages/Tos"

export const router = createBrowserRouter(
  createRoutesFromElements([
    <Route key={1} element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/messages/*" element={<MessagesPage />} />
      <Route path="/settings/*" element={<SettingsPage />} />
      <Route path="/install" element={<Install />} />
      <Route path="/explorer/:file?" element={<Explorer />} />
      <Route path="/search/:query?" element={<SearchPage />} />
      <Route path="/terms" element={<TOS />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/404" element={<Page404 />} />
      <Route path="/u/:link/*" element={<NostrLinkHandler />} />
      <Route path="/p/:link/*" element={<NostrLinkHandler />} />
      <Route path="/:link/*" element={<NostrLinkHandler />} />
    </Route>,
  ])
)
