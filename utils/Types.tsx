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
    isHostParam: boolean,
    gameRoomIdParam: string 
}

/**
 * Represents the parameters for the setBingoCompletedPlayer function.
 */
export type setBingoCompletedPlayerParams =  {
    uid: string, gameRoomId: string, cellStatus: string, cellValue: string
}

/**
 * Function type of Firebase onsnap callback unsubscribe
 */
export type UnsubscribeOnsnapCallbackFunction = () => void;

export type GameRoomsCallBackFunction = (gameRooms: any[]) => void;

export type BingoCellValues = Array<Array<any>>;
export type RenderRowFunction = (rowNum: any, columns: Array<any>) => any;
export type RenderColumnFunction = (rowNum: any, columnNum: any, cellStatus: number[][], cellValues: BingoCellValues, isModal: boolean) => any;

// ------------------------------------------------------------------------------
export interface NavigatorType {
    navigate: (screen: string, params: { isHostParam: boolean; gameRoomIdParam: string }) => void;
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
    Exit= "Exit",
    Room = "Room",
    Bingo = "Bingo",
    Penalty = "Penalty",
    Tictactoe = "Tactactoe",
    HighLow = "HighLow",
    PlusMinus = "PlusMinus"
}

export interface GameRoomState {
    gameRooms: GameRoom[],
    currentGameRoom: CurrentGameRoom | null,
    gameRoomId: string,
    isHost: boolean,
    gameType: GameType,
    penaltyGameType: GameType,
    isPenaltyAorB: boolean,
    mainGameStart: boolean
}

export interface BingoPlayState {
    bingoBoard: any[]
}

//penalty
export interface Penalty {
    id: string,
    title: string
}

export type PenaltyAType = {
    uid: string, 
    penaltyId: string,
    penaltyTitle: string
}

export interface GamePenalty {
    uid: string, 
    penaltyId: string,
    penaltyTitle: string
}

export interface PenaltySliceType {
    penaltyList:  Penalty[],
    patternASet: boolean,
    patternAList: GamePenalty[],
    patternB: string,
    patternC: number
}

export interface PlusMinusResultType {
    uid: string, 
    result: string
}

export enum Operator {
    plus = "+",
    minus = "-",
  }

export enum ResultPattern {
    input = 'input',
    option = 'option'
  }

export interface PlusMinusCurrentProblem {
    proNum: number,
    firstNum: number, 
    secondNum: number,
    operator: Operator,
    resultPattern: ResultPattern,
    resultOptions: number[],
}

export interface TableColumn {
    key: string;
    title: string;
    width?: number;
    type?: 'text' | 'button' | 'avatar' | 'image' | 'icon' | 'reactnode' | 'function';
    clickFunction?: (item: TableRow) => void;
}

export interface TableRow {
    [key: string]: any;
  }
//Firebase Util Functions Parameters type

