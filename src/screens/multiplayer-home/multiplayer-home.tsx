import React, { ReactElement, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { GradientBackground, Text } from "@components";
import styles from "./multiplayer-home.style";
import { useAuth } from "@contexts/auth-context";
import { colors } from "@utils";
import { getPlayer } from "./multiplayer-home.graphql";
import { API, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api";
import { GetPlayerQuery } from "@api";

type PlayerGamesType = Exclude<
    Exclude<
        Exclude<Exclude<GetPlayerQuery["getPlayer"], undefined>, null>["games"],
        undefined
    >,
    null
>["items"];
type PlayerGameType = Exclude<Exclude<PlayerGamesType, undefined>, null>[0];

export default function MultiplayerHome(): ReactElement {
    const { user } = useAuth();

    const [playerGame, setPlayerGame] =
        useState<PlayerGameType[] | null | undefined>(null);
    const [nextToken, setNextToken] = useState<string | null | undefined>(null);

    const fetchPlayer = async (nextToken: string | null | undefined) => {
        if (nextToken === undefined) nextToken = null;

        if (user) {
            try {
                const player = (await API.graphql(
                    graphqlOperation(getPlayer, {
                        username: user.username,
                        limit: 1,
                        sortDirection: "DESC",
                        nextToken: nextToken
                    })
                )) as GraphQLResult<GetPlayerQuery>;

                if (player.data?.getPlayer?.games) {
                    setPlayerGame(player.data.getPlayer.games.items);
                    setNextToken(player.data.getPlayer.games.nextToken);
                }
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
