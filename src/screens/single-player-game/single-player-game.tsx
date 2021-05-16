import React, { ReactElement } from "react";
import { View, Text, SafeAreaView } from "react-native";
import { GradientBackground } from "@components";

import styles from "./single-player-game.style";

export default function SinglePlayerGame(): ReactElement {
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Text style={{ color: "#fff" }}>Game</Text>
            </SafeAreaView>
        </GradientBackground>
    );
}
