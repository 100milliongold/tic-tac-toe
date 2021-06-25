import React, { ReactElement, useEffect, useState, useRef } from "react";
import {
    Dimensions,
    View,
    Alert,
    TextInput as NativeTextInput
} from "react-native";
import { GradientBackground, Text, TextInput } from "@components";
import { API, graphqlOperation } from "aws-amplify";
import { searchPlayers } from "../multiplayer-home.graphql";
import { GraphQLResult } from "@aws-amplify/api";
import { searchPlayersQuery } from "@api";
import { colors } from "@utils";

const SCREEN_HEIGHT = Dimensions.get("screen").height;

/**
 * Exclude
 * Exclude 타입은 2개의 제네릭 타입을 받을 수 있으며, 조건부 타입(Conditional type)을 이용하여 타입을 정의 한다.
 *
 * type Exclude<T, U> = T extends U ? never : T;
 *
 * 두번째 제네릭 타입에 대하여 첫번째 제네릭 타입이 할당 가능한 타입(Assignable)인지를 여부를 판단하여
 * 할당 가능한 타입을 제외한 나머지 타입들을 이용하여 타입을 정의한다.
 */
type PlayersListType = Exclude<
    searchPlayersQuery["searchPlayers"],
    null
>["items"];

export default function PlayersModal(): ReactElement {
    const [players, setPlayers] = useState<PlayersListType>(null);

    const inputRef = useRef<NativeTextInput | null>(null);

    const fetchPlayers = async (searchString: string) => {
        try {
            const players = (await API.graphql(
                graphqlOperation(searchPlayers, {
                    limit: 10,
                    searchString: searchString
                })
            )) as GraphQLResult<searchPlayersQuery>;
            // console.log("players: ", players.data?.searchPlayers?.items);

            if (players.data?.searchPlayers) {
                setPlayers(players.data.searchPlayers.items);
            }
        } catch (error) {
            Alert.alert(
                "Error!",
                "An error has occurred. Please try again later!"
            );
        }
    };

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 150);
    }, []);

    return (
        <View
            style={{
                height: SCREEN_HEIGHT * 0.6,
                marginTop: SCREEN_HEIGHT * 0.4
            }}
        >
            <GradientBackground>
                <View
                    style={{
                        padding: 20,
                        backgroundColor: colors.purple
                    }}
                >
                    <TextInput
                        ref={inputRef}
                        style={{
                            borderBottomWidth: 0,
                            backgroundColor: colors.darkPurple
                        }}
                        placeholder="Type to search by username or name."
                        returnKeyType="search"
                    />
                </View>
            </GradientBackground>
        </View>
    );
}
