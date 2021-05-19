import React, { ReactElement, useState } from "react";
import { SafeAreaView } from "react-native";
import { GradientBackground, Board } from "@components";

import {
    printFormattedBoard,
    isEmpty,
    isFull,
    getAvailableMoves,
    BoardState,
    isTerminal,
    getBestMove
} from "@utils";

import styles from "./single-player-game.style";

export default function SinglePlayerGame(): ReactElement {
    // prettier-ignore
    const [state, setState] = useState<BoardState>([
        null, "x" ,null,
        "o", null ,"x",
        "o", "o" ,"x",
    ])
    console.log("getBestMove", getBestMove(state, true));

    const handleOnCellPressed = (cell: number): void => {
        const stateCopy: BoardState = [...state];
        if (stateCopy[cell] || isTerminal(stateCopy)) return;
        stateCopy[cell] = "x";
        setState(stateCopy);
    };
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    disabled={Boolean(isTerminal(state))}
                    onCellPressed={cell => {
                        handleOnCellPressed(cell);
                    }}
                    state={state}
                    size={300}
                />
            </SafeAreaView>
        </GradientBackground>
    );
}
