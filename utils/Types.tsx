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
}

export interface BingoWaitingRouteParams {
    isCreator: boolean | null,
    bingoId: string 
}

export type BingoRoomsCallBackFunction = (bingoRooms: BingoRoom[]) => void;

export interface NavigatorType {
    navigate: (screen: string, params: { isCreator: boolean; bingoId: string }) => void;
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