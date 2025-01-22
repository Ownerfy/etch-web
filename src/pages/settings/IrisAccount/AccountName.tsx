import {useNavigate} from "react-router-dom"

interface AccountNameProps {
  name?: string
  link?: boolean
}

export default function AccountName({name = "", link = true}: AccountNameProps) {
  const navigate = useNavigate()
  return (
    <>
      <div>
        Username: <b>{name}</b>
      </div>
      <div>
        Short link:{" "}
        {link ? (
          <a
            href={`https://etch.social/${name}`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/${name}`)
            }}
          >
            etch.social/{name}
          </a>
        ) : (
          <>etch.social/{name}</>
        )}
      </div>
      <div>
        Global Nostr address (nip05): <b>{name}@etch.social</b>
      </div>
    </>
  )
}
