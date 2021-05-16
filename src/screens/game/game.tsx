import React, { ReactElement } from "react";
import { View, Text } from "react-native";
import styles from "./game.style";

export default function Game(): ReactElement {
    return (
        <View style={styles.container}>
            <Text>Game</Text>
        </View>
    );
}
