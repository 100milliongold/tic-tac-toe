import React, { ReactElement, useEffect, useState } from "react";
import { Alert, View, ActivityIndicator } from "react-native";
import { API, graphqlOperation, loadingSceneName } from "aws-amplify";

import { GradientBackground, Text, Board } from "@components";
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
    onUpdateGameById
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

export default function MultiplayerGame({
    navigation,
    route
}: MultiPlayerGameProps): ReactElement {
    const { gameID: existingGameID, invitee } = route.params;
    const [gameID, setGameID] = useState<string | null>(null);
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState(false);
    const [playingTurn, setPlayingTurn] = useState<Moves | false>(false);
    const { user } = useAuth();
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
        if (gameID) {
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
                    }
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [gameID]);

    useEffect(() => {
        initGame();
    }, []);

    return (
        <GradientBackground>
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
                <Board
                    size={300}
                    loading={playingTurn}
                    disabled={
                        game.turn === user.username ||
                        playingTurn !== false ||
                        (game.status !== "ACTIVE" &&
                            game.status !== "REQUESTED")
                    }
                    state={game.state as BoardState}
                    onCellPressed={index => {
                        playTurn(index as Moves);
                    }}
                />
            )}
        </GradientBackground>
    );
}
