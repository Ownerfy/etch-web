import classNames from "classnames"
import React from "react"

import PublishButton from "@/shared/components/ui/PublishButton"
import {Avatar} from "@/shared/components/user/Avatar" // Adjusted import path
import Icon from "@/shared/components/Icons/Icon" // Add this import
import NavLink from "@/shared/components/NavLink" // Adjusted import path
import {useLocalState} from "irisdb-hooks"
import {Link} from "react-router-dom"
import {nip19} from "nostr-tools"

type MenuItem = {
  label?: string
  icon?: string
  link?: string
  loggedInOnly?: boolean
  el?: React.ReactNode
  activeIcon?: string
  inactiveIcon?: string
}

const Footer = () => {
  const [publicKey] = useLocalState("user/publicKey", "")
  const readonly = false

  const MENU_ITEMS: MenuItem[] = [
    {link: "/", icon: "home"},
    CONFIG.features.cashu
      ? {
          link: "/wallet",
          activeIcon: "wallet",
          inactiveIcon: "wallet",
          loggedInOnly: true,
        }
      : {link: "/settings", icon: "settings", loggedInOnly: true},
    {
      el: (
        <div className="flex flex-grow items-center justify-center">
          <PublishButton showLabel={false} />
        </div>
      ),
      loggedInOnly: true,
    },
    {link: "/search", icon: "search"},
  ]

  return (
    // -mb-[1px] because weird 1px gap under footer?
    <footer className="-mb-[1px] md:hidden fixed bottom-0 z-10 w-full bg-base-200 pb-[env(safe-area-inset-bottom)] bg-bg-color">
      <div className="flex">
        {MENU_ITEMS.map(
          (item, index) =>
            (publicKey || !item.loggedInOnly) && (
              <FooterNavItem key={index} item={item} readonly={readonly} />
            )
        )}
        {publicKey && (
          <Link
            className="flex flex-grow p-2 justify-center items-center cursor-pointer"
            to={`/${nip19.npubEncode(publicKey)}`}
          >
            <Avatar pubKey={publicKey} width={40} showBadge={false} />
          </Link>
        )}
      </div>
    </footer>
  )
}

const FooterNavItem = ({item}: {item: MenuItem; readonly: boolean}) => {
  if (item.el) {
    return item.el
  }

  return (
    <NavLink
      to={item.link ?? "/"}
      className={({isActive}) =>
        classNames(
          {active: isActive},
          "flex flex-grow p-4 justify-center items-center cursor-pointer"
        )
      }
    >
      {({isActive}) => renderIcon(item, isActive)}
    </NavLink>
  )
}

const renderIcon = (item: MenuItem, isActive: boolean) => {
  let iconName
  if (item.activeIcon && item.inactiveIcon) {
    iconName = isActive ? item.activeIcon : item.inactiveIcon
  } else {
    iconName = `${item.icon}-${isActive ? "solid" : "outline"}`
  }

  return (item.icon || item.activeIcon) && <Icon className="w-5 h-5" name={iconName} />
}

export default Footer
