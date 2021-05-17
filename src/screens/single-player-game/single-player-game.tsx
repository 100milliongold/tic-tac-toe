import React, { ReactElement } from "react";
import { SafeAreaView } from "react-native";
import { GradientBackground, Board } from "@components";

import {
    printFormattedBoard,
    isEmpty,
    isFull,
    getAvailableMoves,
    BoardState
} from "@utils";

import styles from "./single-player-game.style";

export default function SinglePlayerGame(): ReactElement {
    const b: BoardState = ["x", "o", null, "x", "o", null, "x", "o", null];
    printFormattedBoard(b);
    console.log(isEmpty(b));
    console.log(isFull(b));
    console.log(getAvailableMoves(b));
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
