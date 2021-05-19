import React, { ReactElement, useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native";
import { GradientBackground, Board } from "@components";
import styles from "./single-player-game.style";

import { isEmpty, BoardState, isTerminal, getBestMove } from "@utils";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

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

    const popSoundref = useRef<Audio.Sound | null>(null);
    const pop2Soundref = useRef<Audio.Sound | null>(null);

    const insertCell = (cell: number, symbol: "x" | "o"): void => {
        const stateCopy: BoardState = [...state];
        if (stateCopy[cell] || isTerminal(stateCopy)) return;
        stateCopy[cell] = symbol;
        setState(stateCopy);
        try {
            symbol === "x"
                ? popSoundref.current?.replayAsync()
                : pop2Soundref.current?.replayAsync();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

    useEffect(() => {
        if (gameResult) {
            // handle game finished
            alert("Game Over");
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

    useEffect(() => {
        //여기에서 사운드를 로드
        const popSoundObject = new Audio.Sound();
        const pop2SoundObject = new Audio.Sound();

        const loadSounds = async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            await popSoundObject.loadAsync(require("@assets/pop_1.wav"));
            popSoundref.current = popSoundObject;

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            await pop2SoundObject.loadAsync(require("@assets/pop_2.wav"));
            pop2Soundref.current = pop2SoundObject;
        };
        loadSounds();

        return () => {
            // 여기에서 사운드를 헤제
            popSoundObject && popSoundObject.unloadAsync();
            pop2SoundObject && pop2SoundObject.unloadAsync();
        };
    }, []);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    disabled={Boolean(isTerminal(state) || turn !== "HUMAN")}
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
