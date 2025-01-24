import SocialGraphSettings from "@/pages/settings/SocialGraphSettings"
import {useLocation, Link, Routes, Route} from "react-router-dom"
import {ProfileSettings} from "@/pages/settings/Profile.tsx"
import NotificationSettings from "./NotificationSettings"
import Appearance from "@/pages/settings/Appearance.tsx"
import EtchSettings from "./IrisAccount/IrisSettings"
import {Network} from "@/pages/settings/Network.tsx"
import {RiArrowRightSLine} from "@remixicon/react"
import Icon from "@/shared/components/Icons/Icon"
import Account from "@/pages/settings/Account"
// import WalletSettings from "./WalletSettings"
import Backup from "@/pages/settings/Backup"
import PrivacySettings from "./Privacy"
import {Helmet} from "react-helmet"
import classNames from "classnames"
import Content from "./Content"

function Settings() {
  const location = useLocation()
  const isSettingsRoot = location.pathname === "/settings"

  const settingsGroups = [
    {
      title: "User",
      items: [
        {
          icon: "profile",
          iconBg: "bg-green-500",
          message: "Profile",
          path: "/settings/profile",
        },
        // {
        //   icon: "wallet",
        //   iconBg: "bg-emerald-500",
        //   message: "Wallet",
        //   path: "/settings/wallet",
        // },
        {
          icon: "profile",
          iconBg: "bg-purple-500",
          message: "etch.social username",
          path: "/settings/etch",
        },
      ],
    },
    {
      title: "Application",
      items: [
        {
          icon: "gear",
          iconBg: "bg-purple-500",
          message: "Appearance",
          path: "/settings/appearance",
        },
        {
          icon: "hard-drive",
          iconBg: "bg-yellow-500",
          message: "Content",
          path: "/settings/content",
        },
        // {
        //   icon: "bell-outline",
        //   iconBg: "bg-green-500",
        //   message: "Notifications",
        //   path: "/settings/notifications",
        // },
        // {
        //   icon: "closedeye",
        //   iconBg: "bg-red-500",
        //   message: "Privacy",
        //   path: "/settings/privacy",
        // },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: "relay",
          iconBg: "bg-blue-500",
          message: "Network",
          path: "/settings/network",
        },
        {
          icon: "key",
          iconBg: "bg-gray-500",
          message: "Backup",
          path: "/settings/backup",
        },
        {
          icon: "link",
          iconBg: "bg-teal-500",
          message: "Social Graph",
          path: "/settings/social-graph",
        },
      ],
    },
    {
      title: "Etch",
      items: [
        {
          icon: "hard-drive",
          iconBg: "bg-blue-500",
          message: "About",
          path: "/about",
        },
      ],
    },
    {
      title: "Log out",
      items: [
        {
          icon: "key",
          iconBg: "bg-red-500",
          message: "Log out",
          path: "/settings/account",
        },
      ],
    },
  ]

  return (
    <div className="flex flex-1 h-full relative">
      <nav
        className={`sticky top-0 w-full lg:w-64 p-4 lg:h-screen ${
          isSettingsRoot ? "block" : "hidden"
        } lg:block lg:border-r border-custom`}
      >
        <div className="flex flex-col">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <h3 className="font-bold text-xs text-base-content/50 uppercase tracking-wide mb-2">
                {group.title}
              </h3>
              {group.items.map(({icon, iconBg, message, path}, index) => (
                <Link
                  to={path}
                  key={path}
                  className={classNames(
                    "px-2.5 py-1.5 flex justify-between items-center border border-custom hover:bg-base-300",
                    {
                      "rounded-t-xl": index === 0,
                      "rounded-b-xl": index === group.items.length - 1,
                      "border-t-0": index !== 0,
                      "bg-base-100":
                        location.pathname === path ||
                        (isSettingsRoot && path === "/settings/profile"),
                    }
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1 ${iconBg} rounded-lg flex justify-center items-center text-white`}
                    >
                      <Icon name={icon} size={18} />
                    </div>
                    <span className="text-base font-semibold flex-grow">{message}</span>
                  </div>
                  <RiArrowRightSLine size={18} className="text-base-content" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>
      <div className={`flex-1 p-4 ${isSettingsRoot ? "hidden lg:block" : "block"}`}>
        <div className="p-4 lg:mr-4 md:p-8 rounded-lg bg-base-100 shadow">
          <Routes>
            <Route path="account" element={<Account />} />
            <Route path="network" element={<Network />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="etch" element={<EtchSettings />} />
            <Route path="content" element={<Content />} />
            {/* <Route path="wallet" element={<WalletSettings />} /> */}
            <Route path="backup" element={<Backup />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="social-graph" element={<SocialGraphSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
            <Route path="/" element={<ProfileSettings />} />
          </Routes>
        </div>
      </div>
      <Helmet>
        <title>Settings</title>
      </Helmet>
    </div>
  )
}

export default Settings
