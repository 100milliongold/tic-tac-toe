import React, { ReactElement } from "react";
import {
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    ActivityIndicator
} from "react-native";
import styles from "./button.style";

type ButtonProps = {
    title: string;
    loading: boolean;
} & TouchableOpacityProps;

export default function Button({
    title,
    style,
    loading,
    ...props
}: ButtonProps): ReactElement {
    return (
        <TouchableOpacity
            disabled={loading}
            style={[styles.button, style]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#000" />
            ) : (
                <Text style={styles.buttonText}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
