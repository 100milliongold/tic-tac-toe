import React, { ReactElement, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { PlayerGameType } from "./multiplayer-home.graphql";
import { Text } from "@components";
import { useAuth } from "@contexts/auth-context";
import { colors } from "@utils";
import styles from "./multiplayer-home.style";

export default function GameItem({
    playerGame
}: {
    playerGame: PlayerGameType;
}): ReactElement | null {
    const { user } = useAuth();

    const getResult = (
        playerGame: PlayerGameType
    ): "win" | "loss" | "draw" | false => {
        if (!playerGame || !user) return false;
        const game = playerGame.game;
        if (game.status !== "FINISHED") return false;
        const opponent = game?.players?.items?.find(
            playerGame => playerGame?.player.username !== user.username
        );
        if (game.winner === user.username) return "win";
        if (game.winner === opponent?.player.username) return "loss";
        if (game.winner === null) return "draw";
        return false;
    };

    if (!user) return null;
    const game = playerGame?.game;
    const result = getResult(playerGame);
    const opponent = game?.players?.items?.find(
        playerGame => playerGame?.player.username !== user.username
    );

    useEffect(() => {
        if (game) {
            console.log("mount", game.id);
            return () => {
                console.log("umount", game.id);
            };
        }
    }, []);

    return (
        <TouchableOpacity style={styles.item}>
            <Text style={styles.itemTitle}>
                {opponent?.player.name} ({opponent?.player.username})
            </Text>
            {(game?.status === "REQUESTED" || game?.status === "ACTIVE") && (
                <Text
                    style={{
                        color: colors.lightGreen,
                        textAlign: "center"
                    }}
                >
                    {game.turn === user.username
                        ? "Your Turn!"
                        : `Waiting for ${opponent?.player.username}`}
                </Text>
            )}
            {result && (
                <Text style={{ color: colors[result], textAlign: "center" }}>
                    {result === "win" && "You Won!"}
                    {result === "loss" && "You Lost!"}
                    {result === "draw" && "It's a draw!"}
                </Text>
            )}
        </TouchableOpacity>
    );
}
