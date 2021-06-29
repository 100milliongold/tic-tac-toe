import React, { ReactElement, useEffect, useState } from "react";
import {
    Alert,
    View,
    ActivityIndicator,
    SafeAreaView,
    Dimensions
} from "react-native";
import { API, graphqlOperation, loadingSceneName } from "aws-amplify";

import { GradientBackground, Text, Board, Button } from "@components";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { StackNavigatorParams } from "@config/navigator";
import { getGame, startGame, playMove } from "./multiplayer-game.graphql";
import { GraphQLResult } from "@aws-amplify/api";
import { getGameQuery, startGameMutation, playMoveMutation } from "@api";
import { useAuth } from "@contexts/auth-context";
import styles from "./multiplayer-game.styles";
import {
    BoardState,
    colors,
    Moves,
    getErrorMessage,
    onUpdateGameById,
    isTerminal,
    useSounds
} from "@utils";
import Observable from "zen-observable";

type GameType = getGameQuery["getGame"];
type MultiplayerGameScreenNavigationProp = StackNavigationProp<
    StackNavigatorParams,
    "MultiplayerGame"
>;
type MultiplayerGameScreenRouteProp = RouteProp<
    StackNavigatorParams,
    "MultiplayerGame"
>;

type MultiPlayerGameProps = {
    navigation: MultiplayerGameScreenNavigationProp;
    route: MultiplayerGameScreenRouteProp;
};

const SCREEN_WIDTH = Dimensions.get("screen").width;

export default function MultiplayerGame({
    navigation,
    route
}: MultiPlayerGameProps): ReactElement {
    const { gameID: existingGameID, invitee } = route.params;
    const [gameID, setGameID] = useState<string | null>(null);
    const [game, setGame] = useState<GameType | null>(null);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [playingTurn, setPlayingTurn] = useState<Moves | false>(false);
    const { user } = useAuth();
    const gameResult = game ? isTerminal(game.state as BoardState) : false;
    const playSound = useSounds();
    const opponentUsername =
        game && user && game.owners.find(p => p !== user.username);

    const player1 = game?.players?.items && game.players.items[0];
    const player2 = game?.players?.items && game.players.items[1];

    const isActive = () => {
        return game && (game.status === "ACTIVE" || game.status === "REQUESTED");
    };

    // console.log(gameID , invitee);

    const initGame = async () => {
        setLoading(true);
        let gameID = existingGameID;
        try {
            if (!gameID) {
                const startGameRes = (await API.graphql(
                    graphqlOperation(startGame, {
                        invitee
                    })
                )) as GraphQLResult<startGameMutation>;
                if (startGameRes.data?.startGame) {
                    gameID = startGameRes.data.startGame.id;
                    // console.log(startGameRes.data.startGame.id);
                }
            }
            if (gameID) {
                const getGameRes = (await API.graphql(
                    graphqlOperation(getGame, {
                        id: gameID
                    })
                )) as GraphQLResult<getGameQuery>;
                if (getGameRes.data?.getGame) {
                    if (getGameRes.data.getGame.status === "FINISHED") {
                        setFinished(true);
                    }
                    // console.log(getGameRes.data.getGame);
                    setGame(getGameRes.data.getGame);
                    setGameID(gameID);
                }
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error!", getErrorMessage(error));
        }
        setLoading(false);
    };

    const playTurn = async (index: Moves) => {
        console.log(index);
        
        setPlayingTurn(index);
        try {
            const playMoveRes = (await API.graphql(
                graphqlOperation(playMove, {
                    index,
                    game: gameID
                })
            )) as GraphQLResult<playMoveMutation>;
            if (game && playMoveRes.data?.playMove) {
                const { status, state, turn, winner } =
                    playMoveRes.data.playMove;
                setGame({ ...game, status, state, turn, winner });
            }

            console.log(playMoveRes);
        } catch (error) {
            Alert.alert("Error!", getErrorMessage(error));
        }
        setPlayingTurn(false);
    };

    useEffect(() => {
        if (game && (game.status === "ACTIVE" || game.status === "REQUESTED")) {
            const gameUpdates = API.graphql(
                graphqlOperation(onUpdateGameById, {
                    id: gameID
                })
            ) as unknown as Observable<{ [key: string]: any }>;

            const subscription = gameUpdates.subscribe({
                next: ({ value }) => {
                    // console.log(value);
                    const newGame = value.data.onUpdateGameById;
                    if (newGame && game) {
                        const { status, state, turn, winner } = newGame;
                        setGame({ ...game, status, state, turn, winner });
                        if (user) {
                            user.username === turn
                                ? playSound("pop1")
                                : playSound("pop2");
                        }
                    }
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [gameID]);

    useEffect(() => {
        if (game && game.status === "FINISHED" && !finished) {
            if (game.winner === null) {
                playSound("draw");
            } else if (user && game.winner === user.username) {
                playSound("win");
            } else {
                playSound("loss");
            }
        }
    }, [game]);

    useEffect(() => {
        initGame();
    }, []);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                {loading && (
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <ActivityIndicator color={colors.lightGreen} />
                    </View>
                )}
                {game && user && (
                    <>
                        <View style={{ width: SCREEN_WIDTH - 60 }}>
                            <Text style={styles.turn} numberOfLines={1}>
                                {game.turn === user.username && isActive() && "Your Turn"}
                                {game.turn === opponentUsername &&
                                    isActive() &&
                                    `Waiting for ${opponentUsername}`}
                                {!isActive() && "Game Over"}
                            </Text>
                            <View style={styles.gameInfo}>
                                <View
                                    style={[
                                        styles.player,
                                        game.turn === player1?.player.username &&
                                            isActive() &&
                                            styles.playerTurn,
                                        { alignItems: "flex-end" }
                                    ]}
                                >
                                    <Text style={styles.playerName} numberOfLines={1}>
                                        {player1?.player.name}
                                    </Text>
                                    <Text
                                        weight="400"
                                        style={styles.playerUsername}
                                        numberOfLines={1}
                                    >
                                        {player1?.player.username}
                                    </Text>
                                </View>
                                <View style={styles.vs}>
                                    <Text style={styles.vsText}>Vs</Text>
                                </View>
                                <View
                                    style={[
                                        styles.player,
                                        game.turn === player2?.player.username &&
                                            isActive() &&
                                            styles.playerTurn
                                    ]}
                                >
                                    <Text style={styles.playerName} numberOfLines={1}>
                                        {player2?.player.name}
                                    </Text>
                                    <Text
                                        weight="400"
                                        style={styles.playerUsername}
                                        numberOfLines={1}
                                    >
                                        {player2?.player.username}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Board
                            size={SCREEN_WIDTH - 60}
                            state={game.state as BoardState}
                            loading={playingTurn}
                            gameResult={gameResult}
                            disabled={
                                game.turn !== user.username ||
                                playingTurn !== false ||
                                (game.status !== "ACTIVE" && game.status !== "REQUESTED")
                            }
                            onCellPressed={index => {
                                playTurn(index as Moves);
                            }}
                        />
                    </>
                )}
                {game && user && game.status === "FINISHED" && (
                    <View style={styles.modal}>
                        <Text style={styles.modalText}>
                            {game.winner === user.uaername && "You Won"}
                            {game.winner === opponentUsername && "You Lost"}
                            {game.winner === null && "It's a Draw"}
                        </Text>
                        <Button
                            onPress={() => {
                                if (opponentUsername) {
                                    navigation.replace("MultiplayerGame", {
                                        invitee: opponentUsername
                                    });
                                }
                            }}
                            title="Play Again"
                        />
                    </View>
                )}
            </SafeAreaView>
        </GradientBackground>
    );
}
