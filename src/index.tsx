import React from "react";
import { StyleSheet, Text, View,  } from "react-native";
import { useFonts, DeliusUnicase_400Regular , DeliusUnicase_700Bold } from "@expo-google-fonts/delius-unicase";
import AppLoading from 'expo-app-loading';

export default function App() {
    const [fontLoaded] = useFonts({
        DeliusUnicase_400Regular,
        DeliusUnicase_700Bold
    })
    if(!fontLoaded) return <AppLoading />;
    return (
        <View style={styles.container}>
            <Text style={{ fontSize : 25 , fontFamily: 'DeliusUnicase_400Regular'}}>Hello world</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
});
