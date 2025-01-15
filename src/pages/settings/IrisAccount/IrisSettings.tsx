import IrisAccount from "./IrisAccount"

function IrisSettings() {
  return (
    <div>
      <h1 className="text-2xl mb-4">Etch.social username</h1>
      <div className="flex flex-col gap-4 prose">
        <div>
          <IrisAccount />
        </div>
      </div>
    </div>
  )
}

export default IrisSettings
