import React, { ReactElement } from "react";
import { ScrollView, Image, View } from "react-native";
import styles from "./home.style";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground, Button } from "@components";

type HomeProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Home">;
};

export default function Home({ navigation }: HomeProps): ReactElement {
    return (
        <GradientBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <Image
                    style={styles.logo}
                    source={require("@assets/logo.png")}
                />
                <View style={styles.buttons}>
                    <Button
                        title="Single Player"
                        onPress={() => {
                            navigation.navigate("SinglePlayerGame");
                        }}
                        style={styles.button}
                    />
                    <Button title="Multi Player" style={styles.button} />
                    <Button title="Login" style={styles.button} />
                    <Button
                        title="Settings"
                        style={styles.button}
                        onPress={() => {
                            navigation.navigate("Settings");
                        }}
                    />
                </View>
            </ScrollView>
        </GradientBackground>
    );
}
