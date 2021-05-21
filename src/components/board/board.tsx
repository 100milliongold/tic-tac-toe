import React, { ReactElement } from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "../text/Text";

import { BoardState, BoardResult } from "@utils";

import BoardLine from "./board-line";

import styles from "./board.style";

type BoardProps = {
    state: BoardState;
    size: number;
    disabled?: boolean;
    gameResult?: BoardResult | false;
    onCellPressed?: (index: number) => void;
};

export default function Board({
    state,
    size,
    onCellPressed,
    gameResult,
    disabled
}: BoardProps): ReactElement {
    return (
        <View
            style={[
                styles.board,
                {
                    width: size,
                    height: size
                }
            ]}
        >
            {state.map((cell, index) => {
                return (
                    <TouchableOpacity
                        disabled={cell !== null || disabled}
                        onPress={() => onCellPressed && onCellPressed(index)}
                        // styles 겍체 안에 cell 겍체가 있기 때문에 동적으로 해도 에러가 발생하지 않음
                        style={[styles.cell, styles[`cell${index}` as "cell"]]}
                        key={index}
                    >
                        <Text style={[styles.cellText, { fontSize: size / 7 }]}>
                            {cell}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            {gameResult && <BoardLine size={size} gameResult={gameResult} />}
        </View>
    );
}
