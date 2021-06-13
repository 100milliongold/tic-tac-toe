import React, { ReactElement } from "react";
import { ScrollView, View } from "react-native";
import { GradientBackground, Text } from "@components";
import styles from "./multiplayer-home.style";
import { useAuth } from "@contexts/auth-context";
import { colors } from "@utils";

export default function MultiplayerHome(): ReactElement {
    const { user } = useAuth();
    return (
        <GradientBackground>
            {user ? (
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={{ color: colors.lightGreen }}>
                        {user.username}
                    </Text>
                </ScrollView>
            ) : (
                <View style={styles.container}>
                    <Text style={{ color: colors.lightGreen }}>
                        You must be logged in to play multiplayer game!
                    </Text>
                </View>
            )}
        </GradientBackground>
    );
}
