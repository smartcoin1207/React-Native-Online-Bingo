export interface User {
    uid: string  | null, 
    email: string | null,
    displayName: string | null,
    photoURL: string | null
}

export type AuthUserCallBackFunction = (user: User) => void;

export interface BingoRoom {
    bingoId: string,
    uid: string | null, 
    displayName: string,
    photoURL: string | null,
    subscriberNum: string,
    password: string
}

export interface BingoWaitingRouteParams {
    isHost: boolean,
    bingoId: string 
}

export type BingoRoomsCallBackFunction = (bingoRooms: any[]) => void;

export interface NavigatorType {
    navigate: (screen: string, params: { isHost: boolean; bingoId: string }) => void;
    // Add other navigator properties as needed
}

//redux types

export interface UserState {
    authUser: User,
    isLoggedIn: boolean
}

export interface Player {
    uid: string,
    displayName: string,
    photoURL: string
}

export interface CurrentBingoRoom {
    bingoId: string,
    subscribersPlayers: Player[]
}

export interface BingoRoomState {
    bingoRooms: BingoRoom[],
    currentBingoRoom: CurrentBingoRoom | null
}

export interface BingoState {
    bingoId: string
}

export interface BingoPlayState {
    bingoBoard: any[]
}

type BingoCellValues = Array<Array<any>>;
