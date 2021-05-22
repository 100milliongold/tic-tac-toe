import React, { ReactElement, useRef } from "react";
import { ScrollView, TextInput as NativeTextInput } from "react-native";
import styles from "./login.sytles";
import { GradientBackground, TextInput } from "@components";
import { colors } from "@utils";

export default function Login(): ReactElement {
    const passwordRef = useRef<NativeTextInput | null>(null);
    return (
        <GradientBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <TextInput
                    returnKeyType="next"
                    placeholder="Username"
                    style={{
                        marginBottom: 20
                    }}
                    onSubmitEditing={() => {
                        passwordRef.current?.focus();
                    }}
                />
                <TextInput
                    ref={passwordRef}
                    secureTextEntry
                    returnKeyType="done"
                    placeholder="Password"
                />
            </ScrollView>
        </GradientBackground>
    );
}
