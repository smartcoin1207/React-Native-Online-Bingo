import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    BackHandler,
    Modal,
    Dimensions,
    TouchableOpacity,
    Image,
    Animated,
    PanResponder,
    ScrollView,
    FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import {
    setBingoCellStatus,
    setBingoInfo,
    setBingoInitial,
    setBingoNextNumber,
} from "../store/reducers/bingo/bingoSlice";
import {
    bingoCellStatusInit,
    bingoCheck,
    createBingoCard,
} from "../components/BingoEngine";
import _, { result, round } from "lodash";
import { RootState } from "../store";

import {
    getBingo,
    setNextTurnPlayer,
    setBingoNextNumberUpdate,
    setBingoCompletedPlayer,
    setGameTypeF,
    exitGameRoom,
    getGameRoom,
    setBingoRoundEnd,
    setBingoNextRound,
    getGamePenalty,
    getBingoCompletedHistory,
} from "../utils/firebase/FirebaseUtil";
import { BingoCellValues, GameType, Player, UnsubscribeOnsnapCallbackFunction } from "../utils/Types";
import { customColors } from "../utils/Color";
import EffectBorder from "../components/EffectBorder";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { setPenaltyInitial } from "../store/reducers/bingo/penaltySlice";
import { setGameRoomInitial } from "../store/reducers/bingo/gameRoomSlice";
import Language from "../utils/Variables";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");
const screenWidth = Dimensions.get("window").width;
const cellSize = (screenWidth * 0.9) / 5;
const jpLanguage = Language.jp;

type ResultData = {
    uid: string, 
    displayName: string, 
    ranks: number[],
    sum: number,
    firstRankCount: number,
    lastRankCount: number
}

const PlayBoard: React.FC = () => {
    const navigation = useNavigation();
    const [modalCompletedVisible, setModalCompletedVisible] = useState(false);
    const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
    const [bingoEndedModalVisible, setBingoEndedModalVisible] = useState<boolean>(false);
    const [exitModalText, setExitModalText] = useState<string>("");
    const [turnText, setTurnText] = useState<string>("");
    const [cellStatus, setCellStatus] = React.useState<number[][]>(
        bingoCellStatusInit()
    );
    const [sort, setSort] = useState<string[]>([]);
    const [completed, setCompleted] = useState<boolean>(false);
    const [turnPlayerId, setTurnPlayerId] = useState<string>("");
    const [bingoCompleted, setBingoCompleted] = useState<string[]>([]);
    const [bingoNewCompleted, setBingoNewCompleted] = useState<string[]>([]);

    const [bingoCompletedObj, setBingoCompletedObj] = useState<any[]>([]);
    const [bingoCompletedRoundRanking, setBingoCompletedRoundRanking] = useState<string>("");
    const [bingoCompletedMessagesObj, setBingoCompletedMessagesObj] = useState<any[]>([]);
    const [bingoRoundEnded, setBingoRoundEnded] = useState<boolean>(false);
    const [bingoRound, setBingoRound] = useState<number>(1);
    const [bingoAllRoundEnd, setBingoAllRoundEnd] = useState<boolean>(false);
    const [bingoResultTableData, setBingoResultTableData] = useState<any[]>([]);

    const [notifyExpand, setNotifyExpand] = useState(false);
    const [notifyExpandKey, setNotifyExpandKey] = useState(0);

    //bingo selected
    const [selectedCellRow, setSelectedCellRow] = useState<number>(0);
    const [selectedCellColumn, setSelectedCellColumn] = useState<number>(0);
    const [selectedCellValue, setSelectedCellValue] = useState<string>("");
    const [playerOrderList, setPlayerOrderList] = useState<Player[]>([]);
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const gameRoomId = useSelector((state: RootState) => state.gameRoom.gameRoomId);
    const isHost = useSelector((state: RootState) => state.gameRoom.isHost);
    const bingoCellValue = useSelector(
        (state: RootState) => state.bingo.bingoCellValue
    );
    const bingoCellStatus = useSelector(
        (state: RootState) => state.bingo.bingoCellStatus
    );
    const bingoNextNumber = useSelector(
        (state: RootState) => state.bingo.bingoNextNumber
    );
    const bingoPrevNumber = useSelector(
        (state: RootState) => state.bingo.bingoPrevNumber
    );
    const currentGameRoom = useSelector(
        (state: RootState) => state.gameRoom.currentGameRoom
    );

    const bingoMyTurn = useSelector(
        (state: RootState) => state.bingo.bingoMyTurn
    );
    // const penaltyAList = useSelector((state: RootState) => state.penalty.patternAList);
    // const penaltyB = useSelector((state: RootState) => state.penalty.patternB);
    const [penaltyAList, setPenaltyAList] = useState<any[]>([]);
    const [penaltyB, setPenaltyB] = useState<any>();
    const [isPatternASet, setIsPatternASet] = useState<boolean>(false);
    const [isPatternBSet, setIsPatternBSet] = useState<boolean>(false); 
    const [isSubPattern1, setIsSubPattern1] = useState<boolean>(false);
    const [isSubPattern2, setIsSubPattern2] = useState<boolean>(false);
    const [isSubPattern3, setIsSubPattern3] = useState<boolean>(false);
    const [penaltyRunCount, setPenaltyRunCount] = useState<number>(1);

    const [firstPlayerDisplayName, setFirstPlayerDisplayName] = useState("");
    const [lastPlayerDisplayName, setLastPlayerDisplayName] = useState("");
    const [penaltyATitle, setPenaltyATitle] = useState("");
    const [penaltyBTitle, setPenaltyBTitle] = useState("");
    const dispatch = useDispatch();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                setExitModalText(jpLanguage.bingoExitModalTextString);
                setExitModalVisible(true);
                return true; // Indicate that the back press is handled
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [navigation])
    )

    useEffect(() => {
        const fetchGamePenaltyData = async () => {
          const gamePenaltyData = await getGamePenalty(gameRoomId);

          if(gamePenaltyData) {
            setPenaltyRunCount(gamePenaltyData?.penaltyRunCount as number || 1);
            setPenaltyAList(gamePenaltyData?.patternAList || []);
            setPenaltyB(gamePenaltyData?.penaltyB);
            setIsPatternASet(gamePenaltyData?.patternASet);
            setIsPatternBSet(gamePenaltyData?.patternBSet);
            setIsSubPattern1(gamePenaltyData?.subPattern1);
            setIsSubPattern2(gamePenaltyData?.subPattern2);
            setIsSubPattern3(gamePenaltyData?.subPattern3);
          }
          // Handle the game penalty data as needed
        };
      
        fetchGamePenaltyData();
      }, [gameRoomId]);

    useFocusEffect(
        useCallback(() => {
            const unsubscribe1: UnsubscribeOnsnapCallbackFunction = getGameRoom(gameRoomId, (gameRoom: any) => {
                if (!gameRoom) {
                    dispatch(setBingoInitial(null));
                    dispatch(setGameRoomInitial(null));
                    navigation.navigate("gameRoomList");
                    return false;
                }

                if (gameRoom ?.subscribersPlayers) {
                    if (
                        !gameRoom ?.subscribersPlayers.some(
                            (player: any) => player.uid === authUser.uid
                        )
                ) {
                        dispatch(setBingoInitial(null));
                        dispatch(setGameRoomInitial(null));
                        navigation.navigate('gameRoomList');
                        return false;
                    }
                }

                if (gameRoom ?.gameType == GameType.Room && !isHost) {
                    dispatch(setBingoInitial(null));
                    navigation.navigate("currentRoom", { isHostParam: isHost, gameRoomIdParam: gameRoomId });
                }
            })

            return unsubscribe1;
        }, [])
    )

    useEffect(() => {
        console.log("currentRoom", currentGameRoom)
        const sort: string[] = currentGameRoom ?.sort || [];
        setSort(sort);

        let sortedPlayers: Player[] | any[] = [];
        const subscribersPlayers: Player[] = currentGameRoom ?.subscribersPlayers || [];
        if (subscribersPlayers && subscribersPlayers.length > 0) {
            sortedPlayers = sort.map(uid => subscribersPlayers.find(player => player.uid === uid)).filter(Boolean);
            setPlayerOrderList(sortedPlayers);
        }

    }, [JSON.stringify(currentGameRoom)]);

    useEffect(() => {
        setCellStatus(bingoCellStatus);
    }, [bingoCellStatus]);

    useEffect(() => {
        if (!bingoMyTurn) {
            clickCellByOther(bingoNextNumber);
        }
    }, [bingoNextNumber]);

    useEffect(() => {
        if (bingoCompleted.length != bingoNewCompleted.length) {
            setBingoCompleted(bingoNewCompleted);
            const newCount = bingoNewCompleted.length - bingoCompleted.length;
            const messages = bingoCompletedMessagesObj;

            for (let index = 0; index < newCount; index++) {
                const completedPlayerId = bingoNewCompleted[bingoNewCompleted.length - (newCount - index)];
                const rank = bingoNewCompleted.length - (newCount - index);

                if (authUser.uid == completedPlayerId && completed != true) {
                    setCompleted(true);
                    setBingoCompletedRoundRanking((rank + 1).toString());
                    setModalCompletedVisible(true);
                }

                if (authUser.uid != completedPlayerId) {
                    const subscribersPlayers: Player[] | undefined = currentGameRoom ?.subscribersPlayers;

                    if (subscribersPlayers) {
                        const completedPlayer = subscribersPlayers.find(
                            (player) => player.uid === completedPlayerId
                        );

                        if (completedPlayer) {
                            const otherPlayerCellstatus = JSON.parse(bingoCompletedObj[rank] ?.cellstatus);
                            const otherPlayerCellValue = JSON.parse(bingoCompletedObj[rank] ?.cellValue);;

                            const newBingoCompletedMessageObj = {
                                rank: rank,
                                uid: completedPlayerId,
                                displayName: completedPlayer["displayName"],
                                cellStatus: otherPlayerCellstatus,
                                cellValue: otherPlayerCellValue
                            };

                            messages.push(newBingoCompletedMessageObj);
                        }
                    }
                }
            }

            setBingoCompletedMessagesObj(messages);
        }

        if(bingoNewCompleted.length > 0) {
            if(isHost && bingoNewCompleted.length + 1 >= sort.length) {
                setBingoRoundEnd(gameRoomId);
            }
        }

    }, [JSON.stringify(bingoNewCompleted)]);

    useEffect(() => {
        
    }, [bingoRound])

    useEffect(() => {
        const showResult = async () => {
            if(bingoRoundEnded && sort.length > 1) {
                if(bingoRound >= penaltyRunCount) {
                    setBingoAllRoundEnd(true);
                }

                const getPlayersBySort = (sort: string[], subscribers: Player[]): Player[] => {
                    const sortedPlayers: Player[] = [...subscribers];
                  
                    sortedPlayers.sort((player1, player2) => {
                      const index1 = sort.indexOf(player1.uid);
                      const index2 = sort.indexOf(player2.uid);
                      return index1 - index2;
                    });
                  
                    return sortedPlayers;
                  };
                
                const sortedPlayers = getPlayersBySort(sort, currentGameRoom?.subscribersPlayers || []);
                const bingoCompletedHistory = await getBingoCompletedHistory(gameRoomId) || [];

                let historyAll: any[][] = [];
                bingoCompletedHistory.forEach((element:any) => {
                    const roundData = JSON.parse(element);
                    const roundScore = JSON.parse(roundData?.roundScore) as any[];
                    historyAll.push(roundScore);
                });
    
                const remainedBingoSubscribers = sort.filter(playerId => !bingoCompleted.includes(playerId));
                const bingoCompletedAllRank = [...bingoCompleted, ...remainedBingoSubscribers];
                historyAll.push(bingoCompletedAllRank);

                const resultTableData: ResultData[] = sortedPlayers.map((player: Player) => {
                    let sum = 0;
                    let firstRankCount = 0; 
                    let lastRankCount = 0;
                    const playerRanks = historyAll.map((historyOne, index) => {
                        const roundRank = historyOne.indexOf(player.uid);
                        sum += roundRank;
                        firstRankCount += roundRank == 0 ? 1 : 0;
                        lastRankCount += (roundRank >= sortedPlayers.length - 1) ? 1 : 0;
                        return roundRank;
                    });

                    const row: ResultData = {
                        uid: player.uid, 
                        displayName: player.displayName,
                        ranks: playerRanks,
                        firstRankCount: firstRankCount,
                        lastRankCount: lastRankCount,
                        sum: sum,
                    }
    
                    return row;
                });

                if(bingoRound >= penaltyRunCount) {
                    const resortResultTableDataByFirstRank = resultTableData.sort((a: ResultData, b: ResultData) => b.firstRankCount - a.firstRankCount);
                    const firstUid = resortResultTableDataByFirstRank[0].uid;

                    const resortResultTableDataByLastRank = resultTableData.sort((a: ResultData, b: ResultData) => b.lastRankCount - a.lastRankCount);
                    const lastUid = resortResultTableDataByLastRank[0].uid;

                    const firstPlayerDisplayName = getPlayerDisplayName(firstUid) || '';
                    const lastPlayerDisplayName = getPlayerDisplayName(lastUid) || '';
                    const penaltyATitle = getPenaltyATitle(firstUid) || '';
                    const penaltyBTitle = getPenaltyBTitle() || '';

                    setFirstPlayerDisplayName(firstPlayerDisplayName);
                    setLastPlayerDisplayName(lastPlayerDisplayName);
                    setPenaltyATitle(penaltyATitle);
                    setPenaltyBTitle(penaltyBTitle);
                }
                
                console.log(resultTableData)
                setBingoResultTableData(resultTableData);
                setModalCompletedVisible(false);
                setBingoEndedModalVisible(true)
            }
        }

        showResult();
    }, [bingoRoundEnded]);

    const getPlayerDisplayName = (uid: string) => {
        const player = currentGameRoom ?.subscribersPlayers.find((item: Player) => item.uid == uid );
        return player?.displayName;
    }

    const getPenaltyATitle = (uid: string) => {
        const penalty = penaltyAList.find((item:any) => item.uid == uid);
        
        return penalty?.penaltyTitle || '';
    }

    const getPenaltyBTitle = () => {
        
        return penaltyB?.penaltyTitle;
    }

    useEffect(() => {
        if(bingoRound > 1 && !isHost) {
            dispatch(setBingoInitial(null));
            setModalCompletedVisible(false);
            setBingoEndedModalVisible(false);
            setTurnText("");
            setCompleted(false);
            setTurnPlayerId("");
            setBingoCompleted([]);
            setBingoNewCompleted([]);
            setBingoCompletedObj([]);
            setBingoCompletedRoundRanking("");
            setBingoCompletedMessagesObj([]);
            setBingoRoundEnded(false);
            setNotifyExpand(false);
            setNotifyExpandKey(0);
            setSelectedCellRow(0);
            setSelectedCellColumn(0);
            setSelectedCellValue("");
            setPlayerOrderList([]);
        }
    }, [bingoRound])

    //リアルタイムfirestoreから該当するビンゴゲームデータを取得する
    useFocusEffect(
        useCallback(() => {
            const unsubscribe: UnsubscribeOnsnapCallbackFunction = getBingo(gameRoomId, (bingo: any) => {
                const turnPlayerId: string = bingo ?.turnPlayerId || '';
                const bingoMyTurn: boolean = turnPlayerId == authUser.uid;
                const subscribersPlayers: Player[] = currentGameRoom ?.subscribersPlayers || [];
                const bingoCompletedFirestore: string[] = bingo ?.bingoCompleted || [];
                const bingoCompletedObj: any[] = bingo ?.bingoCompletedObj || [];
                const bingoRoundEnd: boolean = bingo ?.bingoRoundEnd || false;

                setBingoRound(bingo?.bingoRound || 1);
                if(bingoRoundEnd) {
                    setBingoRoundEnded(bingoRoundEnd);
                }

                setBingoCompletedObj(bingoCompletedObj);
                setBingoNewCompleted(bingoCompletedFirestore);
                setTurnPlayerId(bingo ?.turnPlayerId);

                const bingoInfo = {
                    bingoMyTurn: bingoMyTurn,
                    bingoNextNumber: bingo ?.bingoNextNumber || "",
                };

                if( isHost && bingoCompletedFirestore.includes(turnPlayerId)) {
                   setNextTurnPlayerId(turnPlayerId, bingoCompletedFirestore); 
                }
                dispatch(setBingoInfo(bingoInfo));
                
                if (bingoMyTurn) {
                    setTurnText(jpLanguage.bingoMyTurnTextString);
                } else {
                    if (subscribersPlayers) {
                        const turnPlayer = subscribersPlayers.find(
                            (player) => player.uid === turnPlayerId
                        );
                        if (turnPlayer) {
                            setTurnText(turnPlayer ?.displayName + jpLanguage.bingoOtherTurnTextString);
                        } else {
                            setTurnText("");
                        }
                    }
                }
            });

            return () => unsubscribe();
        }, [sort])
    )
    
    useFocusEffect(
        useCallback(() => {
            const unsubscribe1: UnsubscribeOnsnapCallbackFunction = getGameRoom(gameRoomId, (gameRoom: any) => {
                if (!gameRoom) {
                    dispatch(setBingoInitial(null));
                    dispatch(setGameRoomInitial(null));
                    navigation.navigate("gameRoomList");
                    return false;
                }

                if (gameRoom ?.subscribersPlayers) {
                    if (
                        !gameRoom ?.subscribersPlayers.some(
                            (player: any) => player.uid === authUser.uid
                        )
                ) {
                        dispatch(setBingoInitial(null));
                        dispatch(setGameRoomInitial(null));
                        navigation.navigate('gameRoomList');
                        return false;
                    }
                }

                if (gameRoom ?.gameType == GameType.Room && !isHost) {
                    dispatch(setBingoInitial(null));
                    navigation.navigate("currentRoom", { isHostParam: isHost, gameRoomIdParam: gameRoomId });
                }
            })

            return unsubscribe1;
        }, [])
    )


    const exitScreen = () => {
        if (isHost) {
            setGameTypeF(gameRoomId, GameType.Room);
            dispatch(setPenaltyInitial(null));
            dispatch(setBingoInitial(null));
            navigation.navigate("currentRoom", { isHostParam: isHost, gameRoomIdParam: gameRoomId });
        } else {
            dispatch(setBingoInitial(null));
            dispatch(setGameRoomInitial(null));
            if (authUser.uid) {
                exitGameRoom(authUser.uid, gameRoomId, false);
            }

            navigation.navigate("gameRoomList");
        }
    }

    const startBingoNextRound = () => {
        dispatch(setBingoInitial(null));
        setModalCompletedVisible(false);
        setBingoEndedModalVisible(false);
        setTurnText("");
        setCompleted(false);
        setTurnPlayerId("");
        setBingoCompleted([]);
        setBingoNewCompleted([]);
        setBingoCompletedObj([]);
        setBingoCompletedRoundRanking("");
        setBingoCompletedMessagesObj([]);
        setBingoRoundEnded(false);
        setNotifyExpand(false);
        setNotifyExpandKey(0);
        setSelectedCellRow(0);
        setSelectedCellColumn(0);
        setSelectedCellValue("");
        setPlayerOrderList([]);

        const remainedBingoSubscribers = sort.filter(playerId => !bingoCompleted.includes(playerId));
        const bingoCompletedAllRank = [...bingoCompleted, ...remainedBingoSubscribers];
        setBingoNextRound(gameRoomId, bingoCompletedAllRank, bingoRound + 1, sort[0]);
    }

    const setNextTurnPlayerId = (
        turnPlayerId: string,
        bingoCompleted: string[]
    ) => {
        try {
            if (sort) {
                const remainedPlayers = sort.filter(item => !bingoCompleted.includes(item));
                let newTurnPlayerId = '';
                if(bingoCompleted.includes(turnPlayerId)) {                    
                    const currentIndexInSort = sort.indexOf(turnPlayerId);
                    for (let i = 0; i < sort.length; i++) {
                        const nextIndexInSort = (currentIndexInSort + 1 + i) % sort.length;
                        if(remainedPlayers.indexOf(sort[nextIndexInSort])> -1) {
                            newTurnPlayerId = sort[nextIndexInSort];
                            break;
                        }
                    }                   
                } else {
                    const currentIndex = remainedPlayers.indexOf(turnPlayerId);
                    const nextIndex = (currentIndex + 1) % remainedPlayers.length;
                    const nextValue = remainedPlayers[nextIndex];
                    newTurnPlayerId = nextValue;
                }

                // if(newTurnPlayerId)
                setNextTurnPlayer(newTurnPlayerId, gameRoomId);
            }
        } catch (error) {
            console.log("sort error was occoured");
        }
    };

    interface CustomNotifierProps {
        item: any;
        onPress: () => void;
    }

    const CustomNotifier: React.FC<CustomNotifierProps> = ({
        item,
        onPress,
    }) => {
        return (
            <DraggableComponent>
                <View style={styles.notifierContainer}>
                    <TouchableOpacity style={{ display: 'flex', alignItems: 'center' }} onPress={() => { if (item ?.rank == notifyExpandKey) { setNotifyExpand(!notifyExpand); } else { setNotifyExpand(true) } setNotifyExpandKey(item ?.rank) }}>
                        <Text style={{
                            
                        }}>
                            <Text style={[styles.notifierDescription, { fontWeight: 'bold', fontSize: 24, textDecorationLine: 'underline' }]}> {item ?.displayName} </Text>
                            <Text style={styles.notifierDescription}> {jpLanguage.bingoOtherMrString} </Text>
                            <Text style={[styles.notifierDescription, { fontWeight: 'bold', fontSize: 24, textDecorationLine: 'underline' }]}> {item ?.rank + 1} {jpLanguage.rankString}</Text>
                            <Text style={styles.notifierDescription}> {jpLanguage.bingoOtherCompletedBingoString}</Text>
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onPress} style={styles.notifierButton}>
                        <Icon name="times" size={20} color="white" />
                    </TouchableOpacity>

                    {(notifyExpand && notifyExpandKey == item ?.rank) &&
                        <View style={{ display: 'flex', alignContent: 'center' }}>
                            <View style={styles.boardContainerOutModalNot}>
                                <View style={[styles.boardContainerModalNot]}>{BingoBoard(item ?.cellStatus, item ?.cellValue, true)}</View>
                            </View>
                        </View>
                    }
                </View>
            </DraggableComponent>
        );
    };

    const closeNotification = (item: any) => {
        const messages = bingoCompletedMessagesObj;
        const updatedItems = messages.filter((item1) => item1.uid !== item.uid);
        setBingoCompletedMessagesObj(updatedItems);
    };

    const renderPlayerItem = ({ item, index }: { item: ResultData, index: number }) => (
        <>
            {index == 0 && 
                <View style={{flexDirection: 'row', height:50, borderWidth:0, borderColor: 'grey', justifyContent: 'space-between', alignItems: 'center', backgroundColor: customColors.customLightBlue}}  key={index + "resultkey"}>
                    
                    {/* <View style={{ width: 60, alignItems: 'center' }}>
                        <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>名前</Text>
                    </View>
                    <View style={{ width: 60, alignItems: 'center', borderLeftWidth:0, borderLeftColor: 'grey', paddingVertical:5 }}>
                        <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>1位</Text>
                    </View>
                    <View style={{ width: 60, alignItems: 'center',  borderLeftWidth:0, borderLeftColor: 'grey', paddingVertical:5 }}>
                        <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>最下位</Text>
                    </View> */}

                    {Array.from({length: bingoRound}, (v, i) => i).map((rank: number, round: number) =>
                        <View key={round + "roundIndex"} style={{ borderLeftWidth:0, borderLeftColor: 'grey', padding: 5, width: ((viewportWidth*0.5-10)/(bingoRound > 3 ? 3: bingoRound)), justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={{color: 'white', textAlign: 'center', letterSpacing: 5, fontSize: 18}}>{(round + 1) + "回"}</Text>
                        </View>
                    )}
                </View>
            }
            
            <View style={{flexDirection: 'row', height:50, borderWidth:0, borderColor: 'grey', justifyContent: 'space-between', alignItems: 'center'}}  key={(index+1) + "resultkey"}>
                {/* <View style={{ width: 60, alignItems: 'center' }}>
                    <Text style={{color: 'white', textAlign: 'center'}}>{item?.displayName}様</Text>
                </View>

                <View style={{ alignItems: 'center', width: 60, borderLeftWidth:0, borderLeftColor: 'grey' }} key={(index+1) + "firstrank"}>
                    <Text style={{color: 'white', textAlign: 'center'}}>{item?.firstRankCount}</Text>
                </View>

                <View style={{ alignItems: 'center', width: 60, borderLeftWidth:0, borderLeftColor: 'grey' }} key={(index+1) + "lastrank"}>
                    <Text style={{color: 'white', textAlign: 'center'}}>{item?.lastRankCount}</Text>
                </View> */}

                {item.ranks.map((rank: number, rankIndex: number) =>
                    <View key={rankIndex + "rankIndex"} style={{ borderLeftWidth:0, borderLeftColor: 'grey', padding: 5, width: ((viewportWidth*0.5-10)/(bingoRound > 3 ? 3: bingoRound)), justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={{color: 'white', textAlign: 'center'}}>{isNaN(rank) ? '' : rank + 1} 位</Text>
                    </View>
                )}
            </View>
        </>
    );

    const renderPlayerItem1 = ({ item, index }: { item: ResultData, index: number }) => (
        <>
            {index == 0 && 
                <View style={{flexDirection: 'row', height:50, borderWidth:0, borderColor: 'grey', justifyContent: 'space-between', alignItems: 'center', backgroundColor: customColors.customLightBlue}}  key={index + "resultkey"}>
                    
                    <View style={{ width: 60, alignItems: 'center' }}>
                        <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>名前</Text>
                    </View>
                    <View style={{ width: 40, alignItems: 'center', borderLeftWidth:0, borderLeftColor: 'grey', paddingVertical:5 }}>
                        <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>1位</Text>
                    </View>
                    <View style={{ width: 60, alignItems: 'center',  borderLeftWidth:0, borderLeftColor: 'grey', paddingVertical:5 }}>
                        <Text style={{color: 'white', textAlign: 'center', fontSize: 15}}>最下位</Text>
                    </View>
                </View>
            }
            
            <View style={{flexDirection: 'row', height:50, borderWidth:0, borderColor: 'grey', justifyContent: 'space-between', alignItems: 'center'}}  key={(index+1) + "resultkey"}>
                <View style={{ width: 60, alignItems: 'center' }}>
                    <Text style={{color: 'white', textAlign: 'center'}}>{item?.displayName}様</Text>
                </View>

                <View style={{ alignItems: 'center', width: 40, borderLeftWidth:0, borderLeftColor: 'grey' }} key={(index+1) + "firstrank"}>
                    <Text style={{color: 'white', textAlign: 'center'}}>{item?.firstRankCount}</Text>
                </View>

                <View style={{ alignItems: 'center', width: 60, borderLeftWidth:0, borderLeftColor: 'grey' }} key={(index+1) + "lastrank"}>
                    <Text style={{color: 'white', textAlign: 'center'}}>{item?.lastRankCount}</Text>
                </View>
            </View>
        </>
    );

    const handleCellClick = (
        rowNum: number,
        columnNum: number,
        cellValue: string,
        cellStatusValue: number
    ) => {
        if (cellStatusValue == 1 || completed || !bingoMyTurn) {
            return false;
        }
        setSelectedCellRow(rowNum);
        setSelectedCellColumn(columnNum);
        setSelectedCellValue(cellValue);
        dispatch(setBingoNextNumber(cellValue));
    };

    const clickCellByOther = (bingoNextNumber: string) => {
        let isValueIncluded = false;
        const value: any[][] = bingoCellValue;
        let row = -1;
        let column = -1;

        for (let i = 0; i < value.length; i++) {
            for (let j = 0; j < value[i].length; j++) {
                if (value[i][j] == bingoNextNumber) {
                    isValueIncluded = true;
                    row = i;
                    column = j;
                    break;
                }
            }
        }
        if (isValueIncluded) {
            bingoBoardCellClick(row, column);
        }
        return isValueIncluded;
    };

    const bingoBoardCellClick = (rowNum: number, columnNum: number) => {
        const cellStatusValue = cellStatus[rowNum][columnNum];
        if (cellStatusValue == 1 || completed) {
            return false;
        }
        const cellStatusValues = cellStatus;
        const rowIndex = rowNum;
        const colIndex = columnNum;
        let newCellStatusValues = cellStatusValues.map((row, i) => {
            if (i === rowIndex) {
                return row.map((col, j) => (j === colIndex ? 1 : col)); // Change the value at the specific index
            } else {
                return row;
            }
        });

        const { isCompleted, newCellStatus } = bingoCheck(
            bingoCellValue,
            newCellStatusValues,
            rowNum,
            columnNum
        );

        dispatch(setBingoCellStatus(newCellStatus));

        if (isCompleted) {

            const cellValueJson = JSON.stringify(bingoCellValue);
            const cellStatusJson = JSON.stringify(newCellStatus);
            if (authUser.uid) {
                setBingoCompletedPlayer({ uid: authUser.uid, gameRoomId: gameRoomId, cellStatus: cellStatusJson, cellValue: cellValueJson });
            }
        }
    };

    const handleSetNumberClick = () => {
        if (!selectedCellValue) {
            return false;
        }
        dispatch(setBingoNextNumber(selectedCellValue));

        const cellStatusValues = cellStatus;
        const rowIndex = selectedCellRow;
        const colIndex = selectedCellColumn;

        let newCellStatusValues = cellStatusValues.map((row, i) => {
            if (i === rowIndex) {
                return row.map((col, j) => (j === colIndex ? 1 : col)); // Change the value at the specific index
            } else {
                return row;
            }
        });

        setSelectedCellValue("");
        if (authUser.uid) {
            setBingoNextNumberUpdate(gameRoomId, selectedCellValue);
            setNextTurnPlayerId(turnPlayerId, bingoCompleted);
        }

        const { isCompleted, newCellStatus } = bingoCheck(
            bingoCellValue,
            newCellStatusValues,
            selectedCellRow,
            selectedCellColumn
        );

        dispatch(setBingoCellStatus(newCellStatus));

        if (isCompleted) {
            const cellValueJson = JSON.stringify(bingoCellValue);
            const cellStatusJson = JSON.stringify(newCellStatus);
            if (authUser.uid) {
                setBingoCompletedPlayer({ uid: authUser.uid, gameRoomId: gameRoomId, cellStatus: cellStatusJson, cellValue: cellValueJson });
            }
        }
    };

    const renderRow = (rowNum: any, columnValue: any): JSX.Element => {
        return (
            <View key={rowNum} style={styles.row}>
                {columnValue}
            </View>
        );
    };

    const getCellStyle = (cellType: string): any => {
        if (cellType == "pressedModal") {
            return styles.pressedModal;
        } else if (cellType == 'pressed') {
            return styles.pressed;
        } else if (cellType == 'bingoCellModal') {
            return styles.bingoCellModal;
        } else if (cellType == 'bingoCell') {
            return styles.bingoCell
        } else if (cellType == 'selectedCell') {
            return styles.selectedCell;
        } else if (cellType == 'normal') {
            return styles.normal;
        }

        return ''
    }

    const renderColumn = (rowNum: number, columnNum: number, cellStatus: number[][], cellValues: BingoCellValues, isModal: boolean): JSX.Element => {
        const cellValue = cellValues[rowNum][columnNum];
        const cellStatusValue = cellStatus[rowNum][columnNum];

        let cellType = "";

        if (cellStatusValue === 1) {
            cellType = isModal ? 'pressedModal' : 'pressed'
        } else if (cellStatusValue == 2) {
            cellType = isModal ? 'bingoCellModal' : 'bingoCell'
        } else if (selectedCellValue == cellValue && !isModal) {
            cellType = 'selectedCell'
        } else {
            cellType = 'normal'
        }

        if (cellStatusValue === -1) {
            return <View key={cellValue}>{renderCell(cellType, cellValue, isModal)}</View>;
        }

        let canClick = true;
        if (cellStatusValue == 1 || completed || !bingoMyTurn || isModal) {
            canClick = false;
        }

        return canClick ? (
            <TouchableOpacity
                key={cellValue}
                onPress={() =>
                    handleCellClick(rowNum, columnNum, cellValue, cellStatusValue)
                }
            >
                {/* {animatedCell(dynamicStyle, cellValue)} */}
                {renderCell(cellType, cellValue, isModal)}
            </TouchableOpacity>
        ) : (
                <View
                    key={cellValue}
                >
                    {renderCell(cellType, cellValue, isModal)}
                </View>
            );
    };

    const renderCell = (cellType: string, cellValue: number, isModal: boolean): JSX.Element => {
        const dynamicStyle = getCellStyle(cellType);

        return (
            <View style={[isModal ? styles.boardSizeModal : styles.boardSize, { borderWidth: 1, borderColor: customColors.white, borderRadius: 10 }]}>
                <Text style={[dynamicStyle]}>
                    {cellValue}
                </Text>
            </View>
        );
    };

    const bingoCardLayout = (cellStatus: number[][], cellValues: BingoCellValues, isModal: boolean) => createBingoCard(
        cellStatus,
        cellValues,
        renderRow,
        renderColumn,
        isModal
    );

    const BingoBoard = (cellStatus: number[][], cellValues: BingoCellValues, isModal: boolean): JSX.Element => {
        return <View style={{ display: 'flex', backgroundColor: customColors.black, alignContent: 'center' }}>{bingoCardLayout(cellStatus, cellValues, isModal)}</View>;
    };

    const ShowOrder = () => {
        return (
            <View style={{ position: 'absolute', left: 5, top: viewportWidth * 0.2 + viewportHeight * 0.05 + 10, width: '25%', height: (viewportHeight - viewportWidth * 1.2 - viewportHeight * 0.05 - 10), borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10 }}>
                <ScrollView >
                    <View style={{ alignItems: 'center', padding: 5 }}>
                        {playerOrderList.map((player, index) => (
                            <View style={{ flexDirection: 'row', marginBottom: 5 }} key={player.uid + "order"}>
                                <View style={{ borderWidth: 1, borderRadius: 20, borderColor: turnPlayerId == player.uid ? customColors.blackGreen : customColors.blackGrey, padding: 5, paddingVertical: 5, marginRight: 5 }}><Text style={{ color: 'white', fontSize: 10 }}>{index + 1}</Text></View>
                                <View style={{ padding: 2, borderRadius: 2, borderWidth: 1, borderColor: turnPlayerId == player.uid ? customColors.blackGreen : customColors.blackGrey }}><Text style={{ color: 'white' }}>{player.displayName}</Text></View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        )
    }

    return (
        <View style={[styles.container, { paddingTop: '5%' }]}>
            <View
                style={{
                    padding: 0,
                    margin: 0,
                    alignItems: "center",
                    width: "100%",
                    position: "absolute",
                    top: 50,
                    zIndex: 100,
                }}
            >
                {bingoCompletedMessagesObj.map((item, index) => (
                    <View key={index} style={{ width: '100%', flex: 1, alignItems: "center" }}>
                        <CustomNotifier
                            item={item}
                            onPress={() => closeNotification(item)}
                        />
                    </View>
                ))}
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={exitModalVisible}
                onRequestClose={() => {
                    setExitModalVisible(false);
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: customColors.modalBackgroundColor,
                    }}
                >
                    <View style={{
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: customColors.modalContainerBackgroundColor,
                        paddingHorizontal: 15,
                        paddingVertical: 50,
                        borderWidth: 1,
                        borderColor: "grey",
                        borderRadius: 20,
                        width: "80%",
                    }}>
                        <Text style={{ fontSize: 20, color: 'white', textAlign: 'center', }}>{exitModalText}</Text>

                        <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-evenly', width: '100%' }}>
                            <TouchableOpacity
                                style={{ padding: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 10, borderColor: customColors.blackGrey, backgroundColor: customColors.blackGrey }}
                                onPress={() => setExitModalVisible(false)}
                            >
                                <Text style={{ color: 'white', fontSize: 16 }}> {jpLanguage.cancelString} </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ padding: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 10, borderColor: customColors.blackGrey, backgroundColor: customColors.blackRed }}
                                onPress={exitScreen}>
                                <Text style={{ color: 'white', fontSize: 16 }}> {jpLanguage.yesString} </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalCompletedVisible}
                onRequestClose={() => {
                    setModalCompletedVisible(false);
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: customColors.modalBackgroundColor,
                    }}
                >
                    <View style={styles.modalBody}>
                        <Image
                            source={require("../assets/images/bingo-win.gif")}
                            style={styles.backgroundImage}
                        />
                        {modalCompletedVisible && (
                            <View style={styles.boardContainerOutModal}>
                                <View style={styles.boardContainerModal}>{BingoBoard(cellStatus, bingoCellValue, true)}</View>
                            </View>
                        )}
                        <View
                            style={{
                                flexDirection: "row",
                                alignSelf: "center",
                                alignContent: "center",
                                alignItems: "center",
                                position: "absolute",
                                top: '20%'
                            }}
                        >
                            <Text style={styles.completedTextNumber}>
                                {bingoCompletedRoundRanking}
                            </Text>
                            <Text style={styles.completedText}>{jpLanguage.rankString}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.closeTouchableButton}
                            onPress={() => setModalCompletedVisible(false)}
                        >
                            <View style={styles.buttonContainer}>
                                <Icon name="times" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={bingoEndedModalVisible}
                onRequestClose={() => {
                    if(isHost) {
                        if(bingoAllRoundEnd) {
                            setBingoEndedModalVisible(false);
                        }
                    } else {
                        setBingoEndedModalVisible(false);
                    }
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: customColors.modalBackgroundColor,
                    }}
                >
                    <View style={[styles.modalBody, {width: '95%', height: '95%', justifyContent: "flex-start", backgroundColor: customColors.black}]}>

                        <View style={{flex: 1, alignItems: 'center', width: '100%'}}>
                            <View style={{marginVertical: 10}}>
                                <Text style={{color: 'white', fontSize: 20}}>ゲーム結果</Text>
                            </View>

                            <View style={[styles.FlatResultDataListStyle, {paddingHorizontal: 2, borderWidth:1, borderColor: 'grey', borderRadius: 0, flexDirection: 'row', justifyContent: 'space-between' }]}>
                                <View style={{width: '50%'}}>
                                    <FlatList
                                        data={bingoResultTableData}
                                        renderItem={renderPlayerItem1}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                </View>
                                <View style={{width: '50%', borderLeftWidth:1, borderLeftColor:'#75787d8c', paddingLeft:0}}>
                                    <ScrollView horizontal={true}>
                                        <FlatList
                                            data={bingoResultTableData}
                                            renderItem={renderPlayerItem}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                    </ScrollView>
                                </View>
                            </View>

                            {bingoAllRoundEnd && 
                                <View style={{width: '100%', marginTop: 30}}>
                                    <Text style={{color: 'white', fontSize: 20, textAlign: 'center'}}>罰ゲーム実行</Text>

                                    <View style={{borderWidth:1, borderRadius: 5, width: '100%', padding:5, paddingVertical: 10, marginVertical: 10}}>
                                        {(penaltyATitle && isPatternASet) && 
                                            <View style={{ padding:10, borderWidth:1, borderColor: customColors.customLightBlue, borderRadius:10, marginVertical: 10}}>
                                                <Text style={{color: 'white', textAlign: 'center', fontSize: 18, textDecorationLine: 'underline'}}>{firstPlayerDisplayName}(様) {' => '} {lastPlayerDisplayName}(様)</Text>
                                                <Text style={{color: 'white', textAlign: 'center', fontSize: 15, marginTop: 10}}>{penaltyATitle}</Text>
                                                <View style={{}}></View>
                                            </View>
                                        }
                                        {(penaltyBTitle && isPatternBSet) && 
                                            <View style={{padding:10, borderWidth:1, borderColor: customColors.customLightBlue, borderRadius:10, marginVertical: 10}}>
                                                <Text style={{color: 'white', textAlign: 'center', fontSize: 18, textDecorationLine: 'underline'}}>共通罰ゲーム  {'  =>  '} {lastPlayerDisplayName}(様)</Text>
                                                <Text style={{color: 'white', textAlign: 'center', fontSize: 15,  marginTop: 10}}>{penaltyBTitle}</Text>
                                            </View>
                                        }
                                    </View>
                                </View>
                            }
                        </View>
                        
                        
                        {(isHost && !bingoAllRoundEnd) && (
                            <TouchableOpacity
                                style={{ padding: 10, borderWidth:1, borderColor: customColors.blackGrey, borderRadius: 20, backgroundColor: customColors.customLightBlue, justifyContent: 'center', alignItems: 'center', marginTop: 10}}
                                onPress={() => startBingoNextRound()}
                            >
                                <Text style={{fontSize: 18, color: 'white', letterSpacing: 5}}>次の回転</Text>
                            </TouchableOpacity>
                        )}
                        
                    </View>
                </View>
            </Modal>

            <Text style={styles.title}>BINGO</Text>
            {/* <ShowOrder /> */}

            <View style={styles.container}>

                <View style={styles.row}>
                    <View style={styles.randomContainer}>
                        <Text style={styles.selected}>{bingoPrevNumber}</Text>
                    </View>
                    {bingoNextNumber ? (
                        <View style={styles.randomContainer}>
                            <Text style={styles.selected}>{bingoNextNumber}</Text>
                        </View>
                    ) : (
                            <View style={styles.randomContainer}>
                            </View>
                        )}
                </View>

                <Text style={styles.turnText}>{turnText}</Text>

                <View style={{ position: 'absolute', bottom: 0 }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        {bingoMyTurn ? (
                            <EffectBorder style={{ width: '40%', marginBottom: 10 }}>
                                <TouchableOpacity
                                    style={styles.passBtn}
                                    onPress={handleSetNumberClick}
                                >
                                    <Text style={styles.passBtnText}> {jpLanguage.bingoDecisionTextString} </Text>
                                </TouchableOpacity>
                            </EffectBorder>
                        ) : (
                                ""
                            )}
                    </View>
                    <View style={styles.boardContainerOut}>
                        <View style={styles.boardContainer}>{BingoBoard(cellStatus, bingoCellValue, false)}</View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default PlayBoard;

interface DraggableComponentProps {
    children: ReactNode;
}
const DraggableComponent: React.FC<DraggableComponentProps> = ({ children }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event(
            [null, { dx: pan.x }],
            { useNativeDriver: false }
        ),
        onPanResponderRelease: () => {
            Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: true,
            }).start();
        },
    });
    return (
        <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', width: '100%' }}>
            <Animated.View
                style={{ transform: [{ translateX: pan.x }] }}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: "black",
        alignItems: "center",
        position: "relative",
    },
    title: {
        color: customColors.white,
        fontSize: viewportWidth * 0.2,
        fontWeight: "700",
    },
    modalBtn: {
        display: "flex",
        flexDirection: "row",
    },
    modalStyle: {
        backgroundColor: "black",
        paddingTop: 10,
        borderWidth: 3,
        borderColor: customColors.white,
    },
    randomContainer: {
        flexDirection: "column",
        backgroundColor: "black",
        alignItems: "center",
        borderColor: "grey",
        width: viewportHeight * 0.1,
        height: viewportHeight * 0.1,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 5,
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    selected: {
        color: customColors.white,
        fontSize: viewportWidth * 0.1,
        borderColor: customColors.white,
        alignItems: "center",
        verticalAlign: "middle",
    },
    randomBtn: {
        backgroundColor: customColors.blackGreen,
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
    },
    randomText: {
        fontSize: 16,
        color: customColors.white,
        fontFamily: "serif",
        fontWeight: "700",
        textAlign: "center",
    },
    turnText: {
        fontSize: 16,
        color: customColors.white,
        fontFamily: "serif",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
    },
    modalBody: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: customColors.modalContainerBackgroundColor,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "grey",
        borderRadius: 20,
        width: "82%",
        height: "80%",
    },
    modalOkBtn: {
        backgroundColor: customColors.blackGreen,
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: customColors.white,
    },
    modalCancelBtn: {
        backgroundColor: "grey",
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: customColors.white,
    },
    modalOkText: {
        fontSize: 20,
        color: customColors.white,
        fontFamily: "serif",
        fontWeight: "700",
        textAlign: "center",
    },
    completedText: {
        fontSize: viewportWidth * 0.15,
        color: customColors.white,
        fontFamily: "serif",
        fontWeight: "900",
        textAlign: "center",
    },
    completedTextNumber: {
        fontSize: viewportWidth * 0.25,
        color: customColors.white,
        fontFamily: "serif",
        fontWeight: "900",
        textAlign: "center",
    },
    roomModalBtns: {
        flexDirection: "row",
    },
    modalText: {
        fontSize: 20,
        color: customColors.white,
        fontFamily: "serif",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
    },

    passBtn: {
        backgroundColor: customColors.customLightBlue,
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: customColors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    passBtnText: {
        fontSize: 20,
        color: customColors.white,
        fontFamily: "serif",
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: 10
    },
    boardContainer: {
        borderColor: customColors.white,
        borderWidth: 2,
        borderRadius: 10,
        padding: viewportWidth * 0.02,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: customColors.customEffectBorderColor,
    },

    boardContainerOut: {
        borderRadius: 10,
        padding: viewportWidth * 0.015,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: customColors.customEffectBorderColor,
    },

    boardContainerModal: {
        borderColor: customColors.white,
        borderWidth: 2,
        borderRadius: 10,
        padding: viewportWidth * 0.02,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: customColors.customEffectBorderColor,
    },

    boardContainerOutModal: {
        position: "absolute",
        bottom: 0,
        borderRadius: 10,
        padding: viewportWidth * 0.015,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: customColors.customEffectBorderColor,
    },

    boardContainerModalNot: {
        display: 'flex',
        borderColor: customColors.white,
        borderWidth: 2,
        borderRadius: 10,
        padding: viewportWidth * 0.02,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#5d1f1182',
    },

    boardContainerOutModalNot: {
        marginTop: 10,
        borderRadius: 10,
        opacity: 0.7,
        padding: viewportWidth * 0.015,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#5d1f1182'
    },

    pressed: {
        width: '86%',
        height: '86%',
        margin: '7%',
        padding: 8,
        borderWidth: 1,
        borderRadius: 80,
        textAlign: "center",
        fontSize: viewportWidth * 0.07,
        fontWeight: "700",
        color: "#c45600",
        borderColor: '#c45600',
        textAlignVertical: "center",
        backgroundColor: "#d8d2cdeb",
    },

    pressedModal: {
        width: '86%',
        height: '86%',
        margin: '7%',
        padding: 8,
        borderWidth: 1,
        borderRadius: 80,
        textAlign: "center",
        fontSize: viewportWidth * 0.06,
        fontWeight: "700",
        color: "#c45600",
        borderColor: '#c45600',
        textAlignVertical: "center",
        backgroundColor: "#d8d2cdeb",
    },

    boardSize: {
        width: cellSize,
        height: cellSize
    },

    boardSizeModal: {
        width: cellSize * 0.8,
        height: cellSize * 0.8
    },

    normal: {
        width: '100%',
        height: '100%',
        padding: 8,
        borderWidth: 1,
        borderRadius: 10,
        textAlign: "center",
        fontSize: viewportWidth * 0.06,
        fontWeight: "700",
        color: customColors.white,
        borderColor: customColors.white,
        textAlignVertical: "center"
    },
    TouchableOpacity: {
        padding: 8,
        borderWidth: 1,
        borderRadius: 5,
        textAlign: "center",
        fontSize: viewportWidth * 0.09,
        fontWeight: "700",
        color: "#04AA6D",
        backgroundColor: customColors.blackGreen,
        borderColor: customColors.white,
        textAlignVertical: "center",
    },
    selectedCell: {
        width: '100%',
        height: '100%',
        // marginLeft: '0%',
        // marginTop: '0%',
        padding: 8,
        borderWidth: 2,
        borderRadius: 10,
        textAlign: "center",
        fontSize: viewportWidth * 0.09,
        fontWeight: "700",
        color: "#04AA6D",
        borderColor: customColors.blackGreen,
        textAlignVertical: "center",
    },
    bingoCell: {
        width: '100%',
        height: '100%',
        padding: 8,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: customColors.blackGreen,
        textAlign: "center",
        fontSize: viewportWidth * 0.1,
        fontWeight: "700",
        backgroundColor: 'yellow',
        color: customColors.blackGreen,
        textAlignVertical: "center",
    },

    bingoCellModal: {
        padding: 8,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: customColors.blackGreen,
        textAlign: "center",
        fontSize: viewportWidth * 0.08,
        fontWeight: "700",
        backgroundColor: 'yellow',
        color: customColors.blackGreen,
        textAlignVertical: "center",
    },
    row: {
        flexDirection: "row",
    },

    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
        height: "60%",
        width: "100%",
        position: "absolute",
        top: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "white",
        opacity: 0.9,
    },

    notifiersContainer: {
        flex: 1,
        position: "absolute",
    },

    notifierContainer: {
        backgroundColor: '#373a38',
        padding: 10,
        borderRadius: 10,
        width: viewportWidth * 0.9,
        alignItems: "center",
        marginBottom: 5,
        borderWidth: 1,
        borderColor: customColors.blackGrey,
    },
    notifierTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    notifierDescription: {
        display: 'flex',
        fontSize: 20,
        color: customColors.white,
    },

    notifierButton: {
        alignItems: "center",
        position: "absolute",
        top: -15,
        right: -15,
        width: 30,
        height: 30,
        padding: 3,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: customColors.white,
    },
    notifierButtonText: {
        color: "white",
        fontWeight: "bold",
    },

    buttonContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        // backgroundColor: 'white',
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
    },

    closeTouchableButton: {
        position: "absolute",
        top: -12,
        right: -12,
    },
    FlatResultDataListStyle: {
        // flex: 1,
        backgroundColor: customColors.customDarkBlueBackground,
        borderRadius: 10,
        padding:2,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

});
