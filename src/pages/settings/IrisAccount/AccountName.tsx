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
            href={`https://etch.social/u/${name}`}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/${name}`)
            }}
          >
            etch.social/u/{name}
          </a>
        ) : (
          <>etch.social/u/{name}</>
        )}
      </div>
      <div>
        Global Nostr address (nip05): <b>{name}@etch.social</b>
      </div>
    </>
  )
}
