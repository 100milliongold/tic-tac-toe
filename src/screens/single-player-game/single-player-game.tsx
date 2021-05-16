import React, { ReactElement } from "react";
import { SafeAreaView } from "react-native";
import { GradientBackground, Board } from "@components";

import styles from "./single-player-game.style";

export default function SinglePlayerGame(): ReactElement {
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    onCellPressed={index => {
                        alert(index);
                    }}
                    state={["x", "o", null, "x", "o", null, "x", "o", null]}
                    size={300}
                />
            </SafeAreaView>
        </GradientBackground>
    );
}
