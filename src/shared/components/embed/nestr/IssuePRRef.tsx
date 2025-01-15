import IssuePRRefComponent from "./IssuePrRefComponent.tsx"
import Embed from "../index.ts"

const ISSUE_PR_REF_REGEX =
  /((?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):(?:i|p):(?:[0-9a-f]{64}):(?:[a-zA-Z0-9]*))/g

const IssuePRRef: Embed = {
  regex: new RegExp(ISSUE_PR_REF_REGEX),
  component: ({match}) => <IssuePRRefComponent match={match} />,
}

export default IssuePRRef
