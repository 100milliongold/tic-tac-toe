import React, { ReactElement, useEffect } from "react";
import { Alert, ScrollView, View } from "react-native";
import { GradientBackground, Text } from "@components";
import styles from "./multiplayer-home.style";
import { useAuth } from "@contexts/auth-context";
import { colors } from "@utils";
import { getPlayer } from "./multiplayer-home.graphql";
import { API, graphqlOperation } from "aws-amplify";

export default function MultiplayerHome(): ReactElement {
    const { user } = useAuth();

    const fetchPlayer = async (nextToken: string | null) => {
        if (user) {
            try {
                const player = await API.graphql(
                    graphqlOperation(getPlayer, {
                        username: user.username,
                        limit: 1,
                        sortDirection: "DESC",
                        nextToken: nextToken
                    })
                );
                console.log(player);
            } catch (error) {
                Alert.alert("Error!", "An error has occurrend!");
            }
        }
    };

    useEffect(() => {
        fetchPlayer(null);
    }, []);

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
