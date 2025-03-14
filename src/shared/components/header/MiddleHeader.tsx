import {useNavigate, useLocation} from "react-router-dom"
import {RiArrowLeftLine} from "@remixicon/react"
import {ReactNode, useCallback} from "react"
import {Helmet} from "react-helmet"
import classNames from "classnames"

interface MiddleHeaderProps {
  title?: string
  children?: ReactNode
  backButton?: boolean
  onBack?: () => void
}

const MiddleHeader = ({title, children, backButton, onBack}: MiddleHeaderProps) => {
  const navigate = useNavigate()
  const {pathname} = useLocation()

  const handleBackClick = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }, [navigate, onBack])

  const handleHeaderClick = useCallback(() => {
    window.scrollTo({top: 0})
  }, [])

  return (
    <header
      className="cursor-pointer md:flex sticky top-0 z-10 w-full bg-base-200 bg-opacity-80 backdrop-blur-sm"
      onClick={handleHeaderClick}
    >
      <div className="mx-auto px-4 py-3 flex items-center w-full">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleBackClick()
          }}
          className={classNames(
            "mr-4 text-base-content hover:text-primary transition-colors",
            {
              hidden: !backButton && pathname === "/",
            }
          )}
          aria-label="Go back"
        >
          <RiArrowLeftLine size={24} />
        </button>
        <div className="flex-grow text-center">
          {children ? (
            children
          ) : (
            <h1 className="text-lg font-semibold text-base-content">{title}</h1>
          )}
        </div>
        <div
          className={classNames("mr-4", {
            hidden: pathname === "/",
          })}
        >
          <RiArrowLeftLine size={24} style={{opacity: 0}} />
        </div>
      </div>
      {title && (
        <Helmet>
          <title>{title}</title>
        </Helmet>
      )}
    </header>
  )
}

export default MiddleHeader
