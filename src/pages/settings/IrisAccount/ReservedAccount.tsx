import AccountName from "./AccountName"

interface ReservedAccountProps {
  name?: string
  enableReserved: () => void
  declineReserved: () => void
}

export default function ReservedAccount({
  name = "",
  enableReserved = () => {},
  declineReserved = () => {},
}: ReservedAccountProps) {
  return (
    <div>
      <p className="success">
        Username etch.social/<b>{name}</b> is reserved for you!
      </p>
      <AccountName name={name} link={false} />
      <p>
        <button className="btn btn-sm btn-primary" onClick={() => enableReserved()}>
          Yes please
        </button>
      </p>
      <p>
        <button className="btn btn-sm btn-neutral" onClick={() => declineReserved()}>
          No thanks
        </button>
      </p>
    </div>
  )
}
