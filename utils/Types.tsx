export interface User {
    uid: string  | null, 
    email: string | null,
    displayName: string | null,
    photoURL: string | null
}

export interface GameRoom {
    gameRoomId: string,
    displayRoomName: string,
    password: string
    uid: string | null,
    displayName: string,
    photoURL: string | null,
    subscriberNum: string,
}

export interface Player {
    uid: string,
    displayName: string,
    photoURL: string
}

// --------------------- Function Params ---------------------------------------------

/**
 * Represents the parameters for the bingoCheck function. 
 */
export interface BingoCheck {
    isCompleted: boolean,
    newCellStatus: any
}

/**
 * Represents the route params from other screen to GameWaitingScreen
 */
export interface GameWaitingRouteParams {
    isHost: boolean,
    gameRoomId: string 
}

export interface PenaltyScreenParams {
    startGame: Function
}

/**
 * Represents the parameters for the setBingoCompletedPlayer function.
 */
export type setBingoCompletedPlayerParams =  {
    uid: string, gameRoomId: string, cellStatus: string, cellValue: string
}

export type GameRoomsCallBackFunction = (gameRooms: any[]) => void;

export type BingoCellValues = Array<Array<any>>;
export type RenderRowFunction = (rowNum: any, columns: Array<any>) => any;
export type RenderColumnFunction = (rowNum: any, columnNum: any, cellStatus: number[][], cellValues: BingoCellValues, isModal: boolean) => any;

// ------------------------------------------------------------------------------
export interface NavigatorType {
    navigate: (screen: string, params: { isHost: boolean; gameRoomId: string }) => void;
}

export interface UserState {
    authUser: User,
    isLoggedIn: boolean
}

export interface CurrentGameRoom {
    gameRoomId: string,
    subscribersPlayers: Player[],
    sort: string[],
    isHost: boolean
}

export enum GameType {
    Bingo = "Bingo",
    Penalty = "Penalty",
    Tictactoe = "Tactactoe"
}

export interface GameRoomState {
    gameRooms: GameRoom[],
    currentGameRoom: CurrentGameRoom | null,
    gameRoomId: string,
    isHost: boolean,
    gameType: GameType
}

export interface BingoPlayState {
    bingoBoard: any[]
}

//penalty
export interface Penalty {
    id: string,
    title: string
}

export interface PenaltySliceType {
    penaltyList:  Penalty[]
}

//Firebase Util Functions Parameters type

