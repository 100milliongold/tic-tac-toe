import React, { ReactElement } from "react";
import { SafeAreaView } from "react-native";
import { GradientBackground, Board } from "@components";

import {
    printFormattedBoard,
    isEmpty,
    isFull,
    getAvailableMoves,
    BoardState,
    isTerminal
} from "@utils";

import styles from "./single-player-game.style";

export default function SinglePlayerGame(): ReactElement {
    // prettier-ignore
    const b: BoardState = [
        "x", "x", "o", 
        "o", "o", "x", 
        "x", "o", "x"
    ];
    printFormattedBoard(b);

    console.log(isTerminal(b));

    // console.log(isEmpty(b));
    // console.log(isFull(b));
    // console.log(getAvailableMoves(b));
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    onCellPressed={index => {
                        alert(index);
                    }}
                    state={b}
                    size={300}
                />
            </SafeAreaView>
        </GradientBackground>
    );
}
