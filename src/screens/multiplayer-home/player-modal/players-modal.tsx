import React, { ReactElement, useEffect, useState, useRef } from "react";
import {
    Dimensions,
    View,
    Alert,
    TextInput as NativeTextInput,
    FlatList,
    ActivityIndicator,
    TouchableOpacity
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

    const [searchQuery, setSearchQuery] = useState("");

    const [submittedQuery, setSubmittedQuery] = useState("");

    const [loading, setLoading] = useState(false);

    const inputRef = useRef<NativeTextInput | null>(null);

    const fetchPlayers = async (searchString: string) => {
        setLoading(true);
        setSubmittedQuery(searchString);
        try {
            const players = (await API.graphql(
                graphqlOperation(searchPlayers, {
                    limit: 10,
                    searchString: searchString
                })
            )) as GraphQLResult<searchPlayersQuery>;
            // console.log("players: ", players.data?.searchPlayers?.items);

            if (players.data?.searchPlayers) {
                // console.log(players.data.searchPlayers.items);

                setPlayers(players.data.searchPlayers.items);
            }
        } catch (error) {
            Alert.alert(
                "Error!",
                "An error has occurred. Please try again later!"
            );
        }
        setLoading(false);
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
                        value={searchQuery}
                        onChangeText={text => setSearchQuery(text)}
                        onSubmitEditing={() => {
                            fetchPlayers(searchQuery);
                        }}
                        style={{
                            borderBottomWidth: 0,
                            backgroundColor: colors.darkPurple
                        }}
                        placeholder="Type to search by username or name."
                        returnKeyType="search"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    {loading ? (
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <ActivityIndicator color={colors.lightGreen} />
                        </View>
                    ) : (
                        <FlatList
                            data={players}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity>
                                        <Text
                                            style={{ color: colors.lightGreen }}
                                        >
                                            {item?.name}
                                        </Text>
                                        <Text
                                            style={{ color: colors.lightGreen }}
                                        >
                                            {item?.username}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                            keyExtractor={player =>
                                player?.username || `${new Date().getTime()}`
                            }
                            ListEmptyComponent={() => {
                                return (
                                    <View>
                                        <Text
                                            style={{ color: colors.lightGreen }}
                                        >
                                            {submittedQuery
                                                ? "No results found!"
                                                : "Type to search by name or username"}
                                        </Text>
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>
            </GradientBackground>
        </View>
    );
}
