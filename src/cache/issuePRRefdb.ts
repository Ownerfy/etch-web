import Dexie from "dexie"

let db: Dexie

export async function getIssuesPRsDB() {
  try {
    if (!db) {
      db = new Dexie("issuePRCache")
      db.version(1).stores({
        issuesPRs: "id, author, repository, title, type", // type: "issue" | "pull-request"
      })
      await db.open()
    }
    return db
  } catch (error) {
    console.warn("Unable to create issuePRCache", error)
  }
}
