import React, { ReactElement, useState, useEffect } from "react";
import { SafeAreaView, Dimensions } from "react-native";
import { GradientBackground, Board } from "@components";
import styles from "./single-player-game.style";

import {
    isEmpty,
    BoardState,
    isTerminal,
    getBestMove,
    Cell,
    useSounds
} from "@utils";

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

    const playSound = useSounds();

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

    useEffect(() => {
        if (gameResult) {
            // handle game finished
            const winner = getWinner(gameResult.winner);
            if (winner === "HUMAN") {
                playSound("win");
                alert("You Won!");
            }
            if (winner === "BOT") {
                playSound("loss");
                alert("You Lost!");
            }
            if (winner === "DRAW") {
                playSound("draw");
                alert("It's a Draw!");
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
                    const best = getBestMove(state, !isHumanMaximizing, 0, -1);
                    insertCell(best, isHumanMaximizing ? "o" : "x");
                    setTurn("HUMAN");
                }
            }
        }
    }, [state, turn]);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    disabled={Boolean(isTerminal(state) || turn !== "HUMAN")}
                    onCellPressed={cell => {
                        handleOnCellPressed(cell);
                    }}
                    state={state}
                    size={SCREEM_WIDTH - 60}
                    gameResult={gameResult}
                />
            </SafeAreaView>
        </GradientBackground>
    );
}
