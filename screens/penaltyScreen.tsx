import * as React from 'react';
import { Dimensions, FlatList, TouchableOpacity, ScrollView, StyleSheet, Text,  TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { customColors } from '../utils/Color';
import { List } from 'react-native-paper';

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const viewRate = viewportWidth/viewportHeight;

const renderTabHeader = (props : any) => <TabBar {...props} />

interface PenaltyTitleItem {
    id: string, 
    title: string
}

const gameRooms: PenaltyTitleItem[] = [
    {
        id: "1  位",
        title: "全員に1杯プレゼントする"
    },
    {
        id: "2  位",
        title: "お会計を1割引にする"
    },
    {
        id: "3  位",
        title: "お酒を一気飲みする"
    },
    {
        id: "4  位",
        title: "お酒を一気飲みする"
    },
    {
        id: "5  位",
        title: "お会計を1割増にする"
    },
    {
        id: "6  位",
        title: " シャンパンを注文する"
    },
    {
        id: "7  位",
        title: "全員に1杯プレゼントする"
    },
    {
        id: "8  位",
        title: "お会計を1割引にする"
    },
    {
        id: "9  位",
        title: "お酒を一気飲みする"
    },
    {
        id: "10  位",
        title: "お酒を一気飲みする"
    },
    {
        id: "11  位",
        title: "お会計を1割増にする"
    },
    {
        id: "12  位",
        title: " シャンパンを注文する"
    },
    {
        id: "13  位",
        title: "全員に1杯プレゼントする"
    },
    {
        id: "14  位",
        title: "お会計を1割引にする"
    },
    {
        id: "15  位",
        title: "お酒を一気飲みする"
    },
];

const renderGameRoomItem = ({ item }: { item: PenaltyTitleItem }) => (
    <TouchableWithoutFeedback>
        <View style={styles.penaltyItemRow}>
            <Text style={{ fontSize: 20, color: 'white', width: '18%' }}>{item.id}</Text>
            {/* <TouchableOpacity style={styles.joinBtn}> */}
            <Text style={{ fontSize: 15, color: 'white', display: 'flex'  }}> {item.title} </Text>
            {/* </TouchableOpacity> */}
        </View>
    </TouchableWithoutFeedback>
  );

// penaltyList Tab start
const FirstRoute = () => {
    const [expanded, setExpanded] = React.useState(true);
    const handlePress = () => setExpanded(!expanded);

    return (
        <View style={{ flex: 1, backgroundColor: customColors.black, marginTop: 10, position: 'relative' }}>
            {/* <View style={{borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10, padding:10, marginHorizontal: 5, display: 'flex', maxHeight: '86%'}}>
                <FlatList
                    data={gameRooms}
                    renderItem={renderGameRoomItem}
                    keyExtractor={(item, index) => index.toString()}
                    // style={{height: '100%'}}
                />
            </View> */}

            <ScrollView
                  showsVerticalScrollIndicator={true} // Set to true to display the vertical scroll bar
                  showsHorizontalScrollIndicator={true} // Set to false to hide the horizontal scroll bar
                  scrollEnabled={true}
                //   style={{backgroundColor: ''}}
            >
                <View style={{ backgroundColor: 'black', padding: 10 }}>
                    <List.Accordion
                        title="今 野"
                        titleStyle={{color: customColors.white}}
                        style={{backgroundColor: customColors.penaltyBackGrey, borderRadius: 20, paddingVertical: 0}}
                        left={props => <List.Icon {...props} icon="flower" />}>
                        <List.Item title="お酒を一気飲み" titleStyle={{color: customColors.white}}/>
                        <List.Item title="一発芸をする" titleStyle={{color: customColors.white}} />
                        <List.Item title="シャンパンを注文する" titleStyle={{color: customColors.white}} />
                        <List.Item title="オヤジギャグを言う" titleStyle={{color: customColors.white}} />
                    </List.Accordion>
                </View>

                <View style={{ backgroundColor: 'black', padding: 10 }}>
                    <List.Accordion
                        title="TANAKA"
                        titleStyle={{color: customColors.white}}
                        style={{backgroundColor: customColors.penaltyBackGrey, borderRadius: 20, paddingVertical: 0}}
                        left={props => <List.Icon {...props} icon="flower" />}>
                        <List.Item title="お酒を一気飲み" titleStyle={{color: customColors.white}}/>
                        <List.Item title="一発芸をする" titleStyle={{color: customColors.white}} />
                        <List.Item title="シャンパンを注文する" titleStyle={{color: customColors.white}} />
                        <List.Item title="オヤジギャグを言う" titleStyle={{color: customColors.white}} />
                    </List.Accordion>
                </View>

                <View style={{ backgroundColor: 'black', padding: 10 }}>
                    <List.Accordion
                        title="鈴木"
                        titleStyle={{color: customColors.white}}
                        style={{backgroundColor: customColors.penaltyBackGrey, borderRadius: 20, paddingVertical: 0}}
                        left={props => <List.Icon {...props} icon="flower" />}>
                        <List.Item title="お酒を一気飲み" titleStyle={{color: customColors.white}}/>
                        <List.Item title="一発芸をする" titleStyle={{color: customColors.white}} />
                        <List.Item title="シャンパンを注文する" titleStyle={{color: customColors.white}} />
                        <List.Item title="オヤジギャグを言う" titleStyle={{color: customColors.white}} />
                    </List.Accordion>
                </View>

                <View style={{ backgroundColor: 'black', padding: 10 }}>
                    <List.Accordion
                        title="今 野"
                        titleStyle={{color: customColors.white}}
                        style={{backgroundColor: customColors.penaltyBackGrey, borderRadius: 20, paddingVertical: 0}}
                        left={props => <List.Icon {...props} icon="flower" />}>
                        <List.Item title="お酒を一気飲み" titleStyle={{color: customColors.white}}/>
                        <List.Item title="一発芸をする" titleStyle={{color: customColors.white}} />
                        <List.Item title="シャンパンを注文する" titleStyle={{color: customColors.white}} />
                        <List.Item title="オヤジギャグを言う" titleStyle={{color: customColors.white}} />
                    </List.Accordion>
                </View>

                <View style={{ backgroundColor: 'black', padding: 10 }}>
                    <List.Accordion
                        title="hayate"
                        titleStyle={{color: customColors.white}}
                        style={{backgroundColor: customColors.penaltyBackGrey, borderRadius: 20, paddingVertical: 0}}
                        left={props => <List.Icon {...props} icon="flower" />}>
                        <List.Item title="お酒を一気飲み" titleStyle={{color: customColors.white}}/>
                        <List.Item title="一発芸をする" titleStyle={{color: customColors.white}} />
                        <List.Item title="シャンパンを注文する" titleStyle={{color: customColors.white}} />
                        <List.Item title="オヤジギャグを言う" titleStyle={{color: customColors.white}} />
                    </List.Accordion>
                </View>
            </ScrollView>

            
           
            <View style={styles.orderBtnGroup}>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.penaltyAddBtn} >
                        <Text style={styles.pressBtnText}> 追  加 </Text>
                    </TouchableOpacity>
                </View>
            </View>
            
        </View>
    )};

const genderGames: PenaltyTitleItem[] = [
    {
        id: "1  位",
        title: "全員に1杯プレゼントする"
    },
    {
        id: "2  位",
        title: "お会計を1割引にする"
    },
    {
        id: "3  位",
        title: "お酒を一気飲みする"
    },
    {
        id: "4  位",
        title: "お酒を一気飲みする"
    },
    {
        id: "4  位",
        title: "お酒を一気飲みする"
    },
    {
        id: "4  位",
        title: "お酒を一気飲みする"
    },
    
];

const renderGenderGameRoomItem = ({ item }: { item: PenaltyTitleItem }) => (
    <View style={styles.penaltyItemRow}>
      {/* <Text style={{ fontSize: 20, color: 'white', width: '18%' }}>{item.id}</Text> */}
      {/* <TouchableOpacity style={styles.joinBtn}> */}
      <Text style={{ fontSize: 15, color: 'white', display: 'flex'  }}> {item.title} </Text>
      {/* </TouchableOpacity> */}
    </View>
  );

const SecondRoute = () => (

    <View style={{flex: 1, backgroundColor: customColors.black, marginTop: 10, position: 'relative' }}>
        <View style={{ height: '50%', backgroundColor: customColors.black, position: 'relative' }}>

                <Text style={{fontSize: 20, color: customColors.white, marginLeft: 10, marginBottom: 5}}>男性</Text>
                <View style={{borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10, padding:10, marginHorizontal: 5, display: 'flex', maxHeight: '65%'}}>
                    <FlatList
                        data={genderGames}
                        renderItem={renderGenderGameRoomItem}
                        keyExtractor={(item, index) => index.toString()}
                        // style={{height: '100%'}}
                    />
                </View>

                <View style={styles.orderBtnGroup}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.penaltyAddBtn} >
                            <Text style={styles.pressBtnText}> 追  加 </Text>
                        </TouchableOpacity>
                    </View>
                </View>
        </View>

        <View style={{ height: '50%', backgroundColor: customColors.black, position: 'relative' }}>
                <Text style={{fontSize: 20, color: customColors.white, marginLeft: 10, marginBottom: 5}}>女性</Text>
                <View style={{borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10, padding:10, marginHorizontal: 5, display: 'flex', maxHeight: '65%'}}>
                    <FlatList
                        data={genderGames}
                        renderItem={renderGenderGameRoomItem}
                        keyExtractor={(item, index) => index.toString()}
                        // style={{height: '100%'}}
                    />
                </View>

                <View style={styles.orderBtnGroup}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.penaltyAddBtn} >
                            <Text style={styles.pressBtnText}> 追  加 </Text>
                        </TouchableOpacity>
                    </View>
                </View>
        </View>
    </View>

);

const ThirdRoute = () => (
    <View style={{flex: 1, backgroundColor: customColors.black, marginTop: 10, position: 'relative' }}>
        <View style={{ height: '50%', backgroundColor: customColors.black, position: 'relative' }}>
                <Text style={{fontSize: 20, color: customColors.white, marginLeft: 10, marginBottom: 5}}>お 店</Text>
                <View style={{borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10, padding:10, marginHorizontal: 5, display: 'flex', maxHeight: '65%'}}>
                    <FlatList
                        data={genderGames}
                        renderItem={renderGenderGameRoomItem}
                        keyExtractor={(item, index) => index.toString()}
                        // style={{height: '100%'}}
                    />
                </View>

                <View style={styles.orderBtnGroup}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.penaltyAddBtn} >
                            <Text style={styles.pressBtnText}> 追  加 </Text>
                        </TouchableOpacity>
                    </View>
                </View>
        </View>

        <View style={{ height: '50%', backgroundColor: customColors.black, position: 'relative' }}>
                <Text style={{fontSize: 20, color: customColors.white, marginLeft: 10, marginBottom: 5}}>お 客</Text>
                <View style={{borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10, padding:10, marginHorizontal: 5, display: 'flex', maxHeight: '65%'}}>
                    <FlatList
                        data={genderGames}
                        renderItem={renderGenderGameRoomItem}
                        keyExtractor={(item, index) => index.toString()}
                        // style={{height: '100%'}}
                    />
                </View>

                <View style={styles.orderBtnGroup}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.penaltyAddBtn} >
                            <Text style={styles.pressBtnText}> 追  加 </Text>
                        </TouchableOpacity>
                    </View>
                </View>
        </View>
    </View>
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute
});

const PenaltyScreen = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: '順位' },
    { key: 'second', title: '男性・女性' },
    {key: 'third', title: 'お店・お客'}
  ]);

  const handleListBtnClick = () => {

  }

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: customColors.white }}
      style={{ backgroundColor: '#000000ab',  borderWidth: 1, borderBottomColor: customColors.blackGrey }}
      labelStyle={{fontSize: viewportWidth*0.04}}
      pressColor={customColors.tabBarBackgroundPressColor}
      activeColor={customColors.blackGreen}
    />
  );

  return (
    <View style={styles.container}>
        <View style={styles.topHeader}>
            <Text style={styles.title}>罰ゲーム</Text>
            <TouchableOpacity style={styles.pressBtn} onPress={handleListBtnClick}>
              <Text style={styles.pressBtnText}> 罰ゲーム一覧 </Text>
            </TouchableOpacity>
        </View>
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            style={{backgroundColor: customColors.black, borderRadius: 10, borderWidth: 1, borderColor: customColors.blackGrey}}
        />
        <View>

        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        paddingTop: viewportHeight*0.02,
        backgroundColor: "#000000"
    },

    title: {
        color: customColors.white,
        fontSize: viewportWidth * 0.1,
        fontWeight: "700",
    },

    pressBtn: {
        // backgroundColor: customColors.blackRed,
        paddingVertical: 5,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: customColors.blackGrey
    },

    pressBtnText: {
        fontSize: 16,
        color: 'white',
        fontFamily: 'serif',
        fontWeight: '700',
        textAlign: 'center',
    },

    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },

    penaltyItemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        marginVertical: 3,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: customColors.blackGrey,
        backgroundColor: customColors.penaltyBackGrey,
        borderRadius: 8,
      },

    penaltyAddBtn: {
        backgroundColor: customColors.blackGreen,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        marginHorizontal: 5,
        borderColor: customColors.white
    },

    orderBtnGroup: {
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
        // height: '10%',
        // backgroundColor: customColors.blackGrey,
        marginHorizontal: 5,
        marginTop: 10,
        paddingTop: 10,
        // borderRadius: 10,
        borderTopColor: customColors.white, 
        borderTopWidth: 1
    }
  })

export default PenaltyScreen;