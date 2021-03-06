import React, { ReactElement, useState, useEffect } from "react";
import { SafeAreaView, View, Dimensions, Platform } from "react-native";
import { GradientBackground, Board, Text, Button } from "@components";
import styles from "./single-player-game.style";
import {
    isEmpty,
    BoardState,
    isTerminal,
    getBestMove,
    Cell,
    useSounds
} from "@utils";
import { useSettings, difficulties } from "@contexts/settings-context";
import { AdMobInterstitial, setTestDeviceIDAsync } from "expo-ads-admob";
import Constants from "expo-constants";

setTestDeviceIDAsync("EMULATOR");

const addUnitID = Platform.select({
    ios:
        Constants.isDevice && !__DEV__
            ? undefined
            : "ca-app-pub-3940256099942544/4411468910",
    android:
        Constants.isDevice && !__DEV__
            ? undefined
            : "ca-app-pub-3940256099942544/1033173712"
});

/**
 * 광고를 클릭해서 앱을 나갈때 이벤트 처리
 */
AdMobInterstitial.addEventListener("interstitialWillLeaveApplication", () => {
    console.log("left app");
});

const SCREEM_WIDTH = Dimensions.get("screen").width;

export default function SinglePlayerGame(): ReactElement {
    // prettier-ignore
    const [state, setState] = useState<BoardState>([
        null, null ,null,
        null, null ,null,
        null, null ,null,
    ])
    // console.log("getBestMove", getBestMove(state, true));

    const [turn, setTurn] = useState<"HUMAN" | "BOT">(
        Math.random() < 0.5 ? "HUMAN" : "BOT"
    );

    // 인간이 셀 선택항목이 가장 많을때 -> 인간이 먼저 선택했는지 여부
    const [isHumanMaximizing, setIsHumanMaximizing] = useState<boolean>(true);

    const [gamesCount, setGamesCount] = useState({
        wins: 0,
        losses: 0,
        draws: 0
    });

    const playSound = useSounds();

    const { settings } = useSettings();

    const insertCell = (cell: number, symbol: "x" | "o"): void => {
        const stateCopy: BoardState = [...state];
        if (stateCopy[cell] || isTerminal(stateCopy)) return;
        stateCopy[cell] = symbol;
        setState(stateCopy);
        try {
            symbol === "x" ? playSound("pop1") : playSound("pop2");
        } catch (error) {
            console.log(error);
        }
    };

    const gameResult = isTerminal(state);

    const handleOnCellPressed = (cell: number): void => {
        if (turn !== "HUMAN") {
            return;
        }
        insertCell(cell, isHumanMaximizing ? "x" : "o");
        setTurn("BOT");
    };

    const getWinner = (winnerSymbol: Cell): "HUMAN" | "BOT" | "DRAW" => {
        if (winnerSymbol === "x") {
            return isHumanMaximizing ? "HUMAN" : "BOT";
        }
        if (winnerSymbol === "o") {
            return isHumanMaximizing ? "BOT" : "HUMAN";
        }
        return "DRAW";
    };

    const newGame = () => {
        // prettier-ignore
        setState([
            null, null ,null,
            null, null ,null,
            null, null ,null,
        ])
        setTurn(Math.random() < 0.5 ? "HUMAN" : "BOT");
    };

    const showAd = async () => {
        if (!addUnitID) {
            return;
        }
        try {
            await AdMobInterstitial.setAdUnitID(addUnitID);
            await AdMobInterstitial.requestAdAsync({
                // 맞춤 광고 표시
                servePersonalizedAds: true
            });
            await AdMobInterstitial.showAdAsync();
        } catch (error) {
            //report
        }
    };

    useEffect(() => {
        if (gameResult) {
            // handle game finished
            const winner = getWinner(gameResult.winner);
            if (winner === "HUMAN") {
                playSound("win");
                setGamesCount({
                    ...gamesCount,
                    wins: gamesCount.wins + 1
                });
            }
            if (winner === "BOT") {
                playSound("loss");
                setGamesCount({
                    ...gamesCount,
                    losses: gamesCount.losses + 1
                });
            }
            if (winner === "DRAW") {
                playSound("draw");
                setGamesCount({
                    ...gamesCount,
                    draws: gamesCount.draws + 1
                });
            }
            const totalGames =
                gamesCount.wins + gamesCount.losses + gamesCount.draws;
            if (totalGames % 3 === 0) {
                showAd();
            }
        } else {
            if (turn === "BOT") {
                if (isEmpty(state)) {
                    const centerAndCorners = [0, 2, 6, 8, 4];
                    const firstMove =
                        centerAndCorners[
                            Math.floor(Math.random() * centerAndCorners.length)
                        ];
                    insertCell(firstMove, "x");
                    setIsHumanMaximizing(false);
                    setTurn("HUMAN");
                } else {
                    /**
                     * state : 상태(게임말) , o or x , 단계(건들지말것), 난이도 : -1 , 1 , 2
                     */
                    const best = getBestMove(
                        state,
                        !isHumanMaximizing,
                        0,
                        parseInt(settings ? settings.difficulty : "-1")
                    );
                    insertCell(best, isHumanMaximizing ? "o" : "x");
                    setTurn("HUMAN");
                }
            }
        }
    }, [state, turn]);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <View>
                    <Text style={styles.difficulty}>
                        Difficulty :{" "}
                        {settings
                            ? difficulties[settings.difficulty]
                            : "Impossible"}
                    </Text>
                    <View style={styles.results}>
                        <View style={styles.resultsBox}>
                            <Text style={styles.resultsTitle}>Wins</Text>
                            <Text style={styles.resultsCount}>
                                {gamesCount.wins}
                            </Text>
                        </View>
                        <View style={styles.resultsBox}>
                            <Text style={styles.resultsTitle}>Draws</Text>
                            <Text style={styles.resultsCount}>
                                {gamesCount.draws}
                            </Text>
                        </View>
                        <View style={styles.resultsBox}>
                            <Text style={styles.resultsTitle}>Losses</Text>
                            <Text style={styles.resultsCount}>
                                {gamesCount.losses}
                            </Text>
                        </View>
                    </View>
                </View>
                <Board
                    disabled={Boolean(isTerminal(state) || turn !== "HUMAN")}
                    onCellPressed={cell => {
                        handleOnCellPressed(cell);
                    }}
                    state={state}
                    size={SCREEM_WIDTH - 60}
                    gameResult={gameResult}
                />
                {gameResult && (
                    <View style={styles.modal}>
                        <Text style={styles.modalText}>
                            {getWinner(gameResult.winner) === "HUMAN" &&
                                "You Won"}
                            {getWinner(gameResult.winner) === "BOT" &&
                                "You Lost"}
                            {getWinner(gameResult.winner) === "DRAW" &&
                                "It's a Draw"}
                        </Text>
                        <Button
                            onPress={() => {
                                newGame();
                            }}
                            title="Play Again"
                        />
                    </View>
                )}
            </SafeAreaView>
        </GradientBackground>
    );
}
