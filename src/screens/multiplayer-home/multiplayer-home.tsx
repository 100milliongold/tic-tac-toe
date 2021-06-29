import React, { ReactElement, useEffect, useState } from "react";
import {
    Alert,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import { GradientBackground, Text, Button } from "@components";
import styles from "./multiplayer-home.style";
import { useAuth } from "@contexts/auth-context";
import { colors } from "@utils";
import { getPlayer, PlayerGameType } from "./multiplayer-home.graphql";
import { API, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api";
import { GetPlayerQuery } from "@api";
import GameItem from "./game-item";
import Modal from "react-native-modal";
import PlayersModal from "./player-modal/players-modal";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";

type MultiplayerHomeScreenNavigationProp = StackNavigationProp<
    StackNavigatorParams,
    "MultiplayerHome"
>;

type MultiplayerHomeProps = {
    navigation: MultiplayerHomeScreenNavigationProp;
};

export default function MultiplayerHome({
    navigation
}: MultiplayerHomeProps): ReactElement {
    const { user } = useAuth();

    const [playerGames, setPlayerGames] =
        useState<PlayerGameType[] | null | undefined>(null);
    const [nextToken, setNextToken] = useState<string | null | undefined>(null);

    const [loading, setLoading] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const [playersModal, setPlayersModal] = useState(false);

    const fetchPlayer = async (
        nextToken: string | null | undefined,
        init = false
    ) => {
        if (nextToken === undefined) nextToken = null;

        if (user) {
            setLoading(true);
            if (nextToken === null && !init) {
                setRefreshing(true);
            }
            try {
                const player = (await API.graphql(
                    graphqlOperation(getPlayer, {
                        username: user.username,
                        limit: 10,
                        sortDirection: "DESC",
                        nextToken: nextToken
                    })
                )) as GraphQLResult<GetPlayerQuery>;
                if (player.data?.getPlayer?.games) {
                    const newPlayerGames =
                        player.data.getPlayer.games.items || [];
                    setPlayerGames(
                        !playerGames || nextToken === null
                            ? newPlayerGames
                            : [...playerGames, ...newPlayerGames]
                    );
                    setNextToken(player.data.getPlayer.games.nextToken);
                }
            } catch (error) {
                Alert.alert("Error!", "An error has occurrend!");
            }
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPlayer(null, true);
    }, []);

    return (
        <GradientBackground>
            {user ? (
                <>
                    <FlatList
                        contentContainerStyle={styles.container}
                        data={playerGames}
                        renderItem={({ item }) => (
                            <GameItem
                                onPress={() => {
                                    if (item?.game) {
                                        navigation.navigate("MultiplayerGame", {
                                            gameID: item?.game.id
                                        });
                                    }
                                }}
                                playerGame={item}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => {
                                    fetchPlayer(null);
                                }}
                                tintColor={colors.lightGreen}
                            />
                        }
                        keyExtractor={playerGame =>
                            playerGame
                                ? playerGame.game.id
                                : `${new Date().getTime()}`
                        }
                        ListFooterComponent={() => {
                            if (!nextToken) return null;
                            return (
                                <Button
                                    style={{ marginTop: 20 }}
                                    loading={loading && !refreshing}
                                    title="Load More"
                                    onPress={() => {
                                        fetchPlayer(nextToken);
                                    }}
                                />
                            );
                        }}
                        ListEmptyComponent={() => {
                            if (loading) {
                                return (
                                    <View style={styles.loading}>
                                        <ActivityIndicator
                                            color={colors.lightGreen}
                                        />
                                    </View>
                                );
                            }
                            return (
                                <View>
                                    <Text style={{ color: colors.lightGreen }}>
                                        No Games Yet
                                    </Text>
                                </View>
                            );
                        }}
                    />
                    <TouchableOpacity
                        style={styles.newGameButton}
                        onPress={() => {
                            setPlayersModal(true);
                        }}
                    >
                        <Text style={styles.newGameButtonText}>New Game</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={styles.container}>
                    <Text style={{ color: colors.lightGreen }}>
                        You must be logged in to play multiplayer game!
                    </Text>
                </View>
            )}
            <Modal
                isVisible={playersModal}
                style={{
                    margin: 0
                }}
                backdropOpacity={0.75}
                avoidKeyboard
                onBackButtonPress={() => {
                    setPlayersModal(false);
                }}
                onBackdropPress={() => {
                    setPlayersModal(false);
                }}
            >
                <PlayersModal
                    onItemPress={username => {
                        // console.log(username);
                        setPlayersModal(false);
                        navigation.navigate("MultiplayerGame", {
                            invitee: username
                        });
                    }}
                />
            </Modal>
        </GradientBackground>
    );
}
