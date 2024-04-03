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

export interface GameWaitingRouteParams {
    isHost: boolean,
    gameRoomId: string 
}

export type GameRoomsCallBackFunction = (gameRooms: any[]) => void;

export interface NavigatorType {
    navigate: (screen: string, params: { isHost: boolean; gameRoomId: string }) => void;
}

export interface UserState {
    authUser: User,
    isLoggedIn: boolean
}

export interface Player {
    uid: string,
    displayName: string,
    photoURL: string
}

export interface CurrentGameRoom {
    gameRoomId: string,
    subscribersPlayers: Player[]
}

export interface GameRoomState {
    gameRooms: GameRoom[],
    currentGameRoom: CurrentGameRoom | null
}

export interface BingoPlayState {
    bingoBoard: any[]
}

export interface Penalty {
    id: string,
    title: string
}

export interface PenaltySliceType {
    penaltyList:  Penalty[]
}