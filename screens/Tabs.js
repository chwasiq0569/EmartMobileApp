import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Button,
    TouchableOpacity, ScrollView, Linking,
    Modal,
    Alert,
    BackHandler
} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ActiveOrders({ orders, fetchOrders }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [order_id, setOrder_Id] = useState(false);
    const [order, setOrder] = useState(false);
    const [rider, setRider] = useState(null);

    const _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('user');
            if (value !== null) {
                console.log('VAL', JSON.parse(value));
                setRider(JSON.parse(value)?.ID);
            }
        } catch (error) {
            Alert.alert("Something went wrong!")
        }
    };

    console.log("rider", rider)
    React.useEffect(() => {
        _retrieveData()
        fetchOrders()
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
        return () => backHandler.remove()
    }, [])

    React.useEffect(() => {
        fetchOrders()
    }, [modalVisible])

    function truncate(string, length) {
        if (string.length > length)
            return string.substring(0, length) + '...';
        else
            return string;
    };

    const openMap = (long, lat, lab) => {
        console.log("long", long)
        console.log("lat", lat)
        console.log("lab", lab)
        const latitude = lat;
        const longitude = long;
        const label = lab;

        const url = Platform.select({
            ios: "maps:" + latitude + "," + longitude + "?q=" + label,
            android: "geo:" + latitude + "," + longitude + "?q=" + label
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                return Linking.openURL(url);
            } else {
                const browser_url =
                    "https://www.google.de/maps/@" +
                    latitude +
                    "," +
                    longitude +
                    "?q=" +
                    label;
                return Linking.openURL(browser_url);
            }
        });
        setTimeout(() => {
            setModalVisible(true);
        }, 1000)
    }

    React.useEffect(() => {
        console.log("order_id|order_id", order_id)
        console.log("order|order", order)
    }, [order_id])

    const order_status_update = (status, riderID, cust_longt, cust_latit, address, order_id) => {
        console.log("status", status)
        console.log("riderID", riderID)
        console.log("cust_longt", cust_longt)
        console.log("cust_latit", cust_latit)
        console.log("address", address)
        console.log("order_id", order_id)
        const details = {
            order_id: order_id,
        }
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        console.log('http://192.168.0.112/myapi/order_completed.php?status=' + status + '&rider=' + riderID)
        fetch('http://192.168.0.112/myapi/order_completed.php?status=' + status + '&rider=' + riderID, {
            method: 'POST',
            body: formBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(res => res.json()).then(data => {
            console.log("data", data)
            if (data.status == true) {

                if (status == 2) {
                    openMap(cust_longt, cust_latit, address, order_id)
                }

                if (data.order_status == "1") {
                    Alert.alert('Order Completed!');
                }
            }
            setModalVisible(false);
            fetchOrders();
        }).catch(err => {
            console.log("ERROR", err)
        })
    }

    return (
        <ScrollView style={styles.container}>
            {orders.length > 0 ?
                orders.map(item => (
                    <TouchableOpacity key={item?.order_id} onPress={() => {
                        setOrder(item);
                        setOrder_Id(item?.order_id);
                        order_status_update(2, rider, item?.cust_longt, item?.cust_latit, item?.address, item?.order_id);
                        // openMap(item?.cust_longt, item?.cust_latit, item?.address, item?.order_id)
                    }}>
                        <View style={styles.individualOrder}>
                            <View style={styles.leftSide}>
                                <Text style={styles.address}>Address: {String(truncate(item?.address, 27))}</Text>
                                <Text style={styles.amount}>Amount: {String(item?.cart_amount)}</Text>
                                {item.Order_Completed == "2" && <Text style={styles.amount}>In Progress</Text>}
                            </View>
                            <Text style={styles.goText}>GO</Text>
                        </View>
                    </TouchableOpacity>
                )) : <Text style={styles.noOrdersStyles}>No Orders</Text>
            }
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}

            >
                <View style={styles.modalStyles}>
                    <Text style={styles.modalTextStyles}>Order Status?</Text>
                    <View style={styles.btnStyles}>
                        <Button onPress={() => order_status_update(1, rider, order?.cust_longt, order?.cust_latit, order?.address, order_id)} style={styles.btnStyles}
                            title="Order Completed"
                            color="#841584"
                        /></View>
                    <View style={styles.btnStyles}>
                        <Button onPress={() => setModalVisible(false)}
                            title="Order Not Completed"
                            color="red"
                        /></View>

                </View>
            </Modal>

        </ScrollView >
    );
}

function CompletedOrders({ orders, fetchOrders }) {

    React.useEffect(() => {
        fetchOrders()
    }, [])

    function truncate(string, length) {
        if (string.length > length)
            return string.substring(0, length) + '...';
        else
            return string;
    };

    return (
        <ScrollView style={styles.container}>
            {orders.length > 0 ?
                orders.map(item => (
                    <TouchableOpacity key={item?.order_id}>
                        <View style={styles.individualOrder}>
                            <View style={styles.leftSide}>
                                <Text style={styles.address}>Address: {String(truncate(item?.address, 27))}</Text>
                                <Text style={styles.amount}>Amount: {String(item?.cart_amount)}</Text>

                            </View>
                            {/* <Text style={styles.goText}>GO</Text> */}
                        </View>
                    </TouchableOpacity>
                )) : <Text style={styles.noOrdersStyles}>No Orders</Text>
            }
        </ScrollView >
    );
}

const Tab = createBottomTabNavigator();

export default function TabsViews(props) {
    console.log("route" + props.navigation);

    const [orders, setOrders] = React.useState([]);

    const fetchOrders = () => {
        fetch("http://192.168.0.112/myapi/apis.php").then(res => res.json()).then(data => {
            setOrders(data)
        })
    }

    React.useEffect(() => {
        fetchOrders();
    }, [])

    return (
        <Tab.Navigator>
            <Tab.Screen name="ActiveOrders" children={(props) => <ActiveOrders {...props} fetchOrders={fetchOrders} orders={orders.filter(order => order.Order_Completed == 0 || order.Order_Completed == 2)} />} />
            <Tab.Screen name="CompletedOrders" children={(props) => <CompletedOrders {...props} fetchOrders={fetchOrders} orders={orders.filter(order => order.Order_Completed == 1)} />} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        backgroundColor: "#E7E9EB",
    },
    individualOrder: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        borderWidth: 2,
        borderRadius: 8,
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        padding: 8,
        marginVertical: 10
    },
    address: {
        fontWeight: "800",
        fontSize: 15
    },
    goText: {
        fontWeight: "800",
        fontSize: 15,
        color: "red"
    },
    modalStyles: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginTop: 250,
        padding: 20,
        borderColor: '#D3DCE3',
        borderWidth: 2
    },
    modalTextStyles: {
        textAlign: 'center',
    },
    btnStyles: {
        marginTop: 8
    },
    noOrdersStyles: {
        textAlign: 'center',
        fontSize: 24,
        marginTop: 8,
        fontWeight: "800",
    }
});