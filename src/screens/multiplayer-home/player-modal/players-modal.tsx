import React, { ReactElement, useEffect } from "react";
import { Dimensions, View, Alert } from "react-native";
import { GradientBackground, Text } from "@components";
import { API, graphqlOperation } from "aws-amplify";
import { searchPlayers } from "../multiplayer-home.graphql";
import { GraphQLResult } from "@aws-amplify/api";
import { searchPlayersQuery } from "@api";

const SCREEN_HEIGHT = Dimensions.get("screen").height;

export default function PlayersModal(): ReactElement {
    const fetchPlayers = async (searchString: string) => {
        try {
            const players = (await API.graphql(
                graphqlOperation(searchPlayers, {
                    limit: 10,
                    searchString: searchString
                })
            )) as GraphQLResult<searchPlayersQuery>;
            console.log("players: ", players.data?.searchPlayers?.items);
        } catch (error) {
            Alert.alert(
                "Error!",
                "An error has occurred. Please try again later!"
            );
        }
    };

    useEffect(() => {
        fetchPlayers("player1");
    }, []);

    return (
        <View
            style={{
                height: SCREEN_HEIGHT * 0.6,
                marginTop: SCREEN_HEIGHT * 0.4
            }}
        >
            <GradientBackground>
                <Text>18</Text>
            </GradientBackground>
        </View>
    );
}
