import React, { ReactElement } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import styles from "./button.style";

type ButtonProps = {
    title: string;
} & TouchableOpacityProps;

export default function Button({
    title,
    style,
    ...props
}: ButtonProps): ReactElement {
    return (
        <TouchableOpacity style={[styles.button, style]} {...props}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
}
