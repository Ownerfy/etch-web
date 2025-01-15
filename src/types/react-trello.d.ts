declare module "react-trello" {
  import * as React from "react"

  export type Card = {
    id: string
    title?: string
    description?: string
    label?: string
    draggable?: boolean
    deleted?: boolean
    laneId?: string
  }

  export type Lane = {
    id: string
    title: string
    cards: Card[]
    style?: React.CSSProperties
    cardStyle?: React.CSSProperties
    editLaneTitle?: boolean
  }

  export type Lanes = {
    lanes: Lane[]
  }

  export interface BoardData {
    lanes: Lane[]
  }

  export interface LaneData {
    title: string
  }

  export type CardClickMetadata = {
    laneId: string
    index: number
  }

  export interface BoardProps {
    data: BoardData
    style?: React.CSSProperties
    editable?: boolean
    canAddLanes?: boolean
    editLaneTitle?: boolean
    onCardAdd?(card: Card, laneId: string): void
    onCardDelete?(cardId: string, laneId: string): void
    onCardMoveAcrossLanes?(fromLaneId: string, toLaneId: string, cardId: string): void
    onCardClick?(cardId: string, metadata: CardClickMetadata, laneId: string): void
    onDataChange?(newData: BoardData): void
    onLaneUpdate?(laneId: string, data: LaneData): void
  }

  class Board extends React.Component<BoardProps> {}

  export default Board
}
