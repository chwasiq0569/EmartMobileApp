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

function ActiveOrders({ orders, fetchOrders }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [order_id, setOrder_Id] = useState(false);

    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
        return () => backHandler.remove()
        fetchOrders()
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

    const openMap = (long, lat, lab, order_id) => {
        setOrder_Id(order_id);
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
        }, 10)
    }

    const order_status_update = (status) => {
        console.log("order_completed")
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
        console.log('http://192.168.0.112/myapi/order_completed.php?status=' + status)
        fetch('http://192.168.0.112/myapi/order_completed.php?status=' + status, {
            method: 'POST',
            body: formBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(res => res.json()).then(data => {
            console.log("data", data)
            if (data.status == true) {
                // navigation.navigate('Orders');
                Alert.alert('Order Completed!')
            }
            else {
                Alert.alert('Order Not Completed!')
            }
            setModalVisible(false);
            fetchOrders();
        })
    }

    return (
        <ScrollView style={styles.container}>
            {orders.length > 0 ?
                orders.map(item => (
                    <TouchableOpacity key={item?.order_id} onPress={() => {
                        order_status_update(2);
                        openMap(item?.cust_longt, item?.cust_latit, item?.address, item?.order_id)
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
                        <Button onPress={() => order_status_update(1)} style={styles.btnStyles}
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
                            <Text style={styles.goText}>GO</Text>
                        </View>
                    </TouchableOpacity>
                )) : <Text style={styles.noOrdersStyles}>No Orders</Text>
            }
        </ScrollView >
    );
}

const Tab = createBottomTabNavigator();

export default function TabsViews() {
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