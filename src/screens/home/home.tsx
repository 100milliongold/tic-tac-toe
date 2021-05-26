import React, { ReactElement } from "react";
import { ScrollView, Image, View } from "react-native";
import styles from "./home.style";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import { GradientBackground, Button, Text } from "@components";
import { useAuth } from "@contexts/auth-context";

type HomeProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Home">;
};

export default function Home({ navigation }: HomeProps): ReactElement {
    const { user } = useAuth();
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
                    <Button
                        title={user ? "Logout" : "Login"}
                        style={styles.button}
                        onPress={() => {
                            if (user) {
                            } else {
                                navigation.navigate("Login");
                            }
                        }}
                    />
                    <Button
                        title="Settings"
                        style={styles.button}
                        onPress={() => {
                            navigation.navigate("Settings");
                        }}
                    />

                    {user && (
                        <Text weight="400" style={styles.loggedInText}>
                            {" "}
                            Logged in as{" "}
                            <Text weight="700">{user.username}</Text>{" "}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </GradientBackground>
    );
}
