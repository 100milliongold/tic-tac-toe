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

    const [playerGames, setPlayerGames] =
        useState<PlayerGameType[] | null | undefined>(null);
    const [nextToken, setNextToken] = useState<string | null | undefined>(null);

    const [loading, setLoading] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

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
                        limit: 2,
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

    const getResult = (
        playerGame: PlayerGameType
    ): "win" | "loss" | "draw" | false => {
        if (!playerGame || !user) return false;
        const game = playerGame.game;
        if (game.status !== "FINISHED") return false;
        const opponent = game?.players?.items?.find(
            playerGame => playerGame?.player.username !== user.username
        );
        if (game.winner === user.username) return "win";
        if (game.winner === opponent?.player.username) return "loss";
        if (game.winner === null) return "draw";
        return false;
    };

    const renderGame = ({ item }: { item: PlayerGameType }) => {
        if (!user) return null;
        const game = item?.game;
        const result = getResult(item);
        const opponent = game?.players?.items?.find(
            playerGame => playerGame?.player.username !== user.username
        );
        return (
            <TouchableOpacity style={styles.item}>
                <Text style={styles.itemTitle}>
                    {opponent?.player.name} ({opponent?.player.username})
                </Text>
                {(game?.status === "REQUESTED" ||
                    game?.status === "ACTIVE") && (
                    <Text
                        style={{
                            color: colors.lightGreen,
                            textAlign: "center"
                        }}
                    >
                        {game.turn === user.username
                            ? "Your Turn!"
                            : `Waiting for ${opponent?.player.username}`}
                    </Text>
                )}
                {result && (
                    <Text
                        style={{ color: colors[result], textAlign: "center" }}
                    >
                        {result === "win" && "You Won!"}
                        {result === "loss" && "You Lost!"}
                        {result === "draw" && "It's a draw!"}
                    </Text>
                )}
            </TouchableOpacity>
        );
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
                        renderItem={renderGame}
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
                    <TouchableOpacity style={styles.newGameButton}>
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
        </GradientBackground>
    );
}
