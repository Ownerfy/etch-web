export type Label = {
  id: string
  name: string
  description: string
  color_code: string
  deleted?: boolean
}

export type Labels = {
  [id: string]: Label
}

export type PullRequest = {
  created_at: number
  id: string
  title: string
  body: string
  repository: string
  author: string
  closed_at?: number
  closed_by?: string
  edit_history?: {[edited_timestamp: number]: string}
  merged_at?: number
  merged_by?: string
  base_ref: string
  compared_ref: string
}

export type PullRequests = {
  [id: string]: PullRequest
}

export type Issue = {
  created_at: number
  id: string
  title: string
  body: string
  repository: string
  author: string
  parent_issue?: string
  closed_at?: number
  closed_by?: string
  edit_history?: {[edited_timestamp: number]: string}
  comments?: RepoComments
}

export type Issues = {
  [id: string]: Issue
}

export type IssuePRCacheItem = {
  id: string
  author: string
  title: string
  repository: string
  type: "issue" | "pull-request"
}

export type RepoComment = {
  id: string
  body: string
  author: string
  timestamp: number
  edit_history?: {[edited_timestamp: number]: string}
}

export type RepoComments = {
  [id: string]: RepoComment
}

export type PRReview = {
  id: string
  body: string
  reviewType: "comment" | "approve" | "request-changes"
  author: string
  timestamp: number
}

export type PRRevies = {
  [id: string]: PRReview
}
