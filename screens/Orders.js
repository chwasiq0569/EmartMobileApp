import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Button,
    TouchableOpacity, ScrollView, Linking,
    Modal
} from "react-native";

function Orders() {

    const [orders, setOrders] = React.useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    React.useEffect(() => {
        fetch("http://192.168.0.112/myapi/apis.php").then(res => res.json()).then(data => {
            setOrders(data)
        })
    }, [])


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

    return (
        <ScrollView style={styles.container}>
            {
                orders.map(item => (
                    <TouchableOpacity key={item?.order_id} onPress={() => openMap(item?.cust_longt, item?.cust_latit, item?.address)}>
                        <View style={styles.individualOrder}>
                            <View style={styles.leftSide}>
                                <Text style={styles.address}>Address: {String(truncate(item?.address, 27))}</Text>
                                <Text style={styles.amount}>Amount: {String(item?.cart_amount)}</Text>
                            </View>
                            <Text style={styles.goText}>GO</Text>
                        </View>
                    </TouchableOpacity>
                ))
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
                        <Button onPress={() => setModalVisible(false)} style={styles.btnStyles}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        // alignItems: "center",
        // justifyContent: "center",
        backgroundColor: "#E7E9EB",
        // paddingTop: 200,
        // overflowY: "scroll"
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
        // marginY: 10,
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
    }
});


export default Orders;