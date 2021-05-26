import React, { ReactElement, useRef, useState } from "react";
import { Alert, ScrollView, TextInput as NativeTextInput } from "react-native";
import styles from "./login.sytles";
import { GradientBackground, TextInput, Button } from "@components";
import { Auth } from "aws-amplify";
import { colors } from "@utils";

export default function Login(): ReactElement {
    const passwordRef = useRef<NativeTextInput | null>(null);
    const [form, setForm] = useState({
        username: "test",
        password: "12345678"
    });
    const [loading, setLoading] = useState(false);
    const setFormInput = (key: keyof typeof form, value: string): void => {
        setForm({ ...form, [key]: value });
    };

    const login = async () => {
        setLoading(true);
        const { username, password } = form;
        console.log(username, password);

        try {
            const res = await Auth.signIn(username, password);
            console.log(res);
        } catch (error) {
            console.log(error);
            Alert.alert("Error!", error.message || "An error occurred!");
        }

        setLoading(false);
    };

    return (
        <GradientBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <TextInput
                    returnKeyType="next"
                    placeholder="Username"
                    value={form.username}
                    onChangeText={value => {
                        setFormInput("username", value);
                    }}
                    style={{
                        marginBottom: 20
                    }}
                    onSubmitEditing={() => {
                        passwordRef.current?.focus();
                    }}
                />
                <TextInput
                    ref={passwordRef}
                    value={form.password}
                    onChangeText={value => {
                        setFormInput("password", value);
                    }}
                    style={{
                        marginBottom: 30
                    }}
                    secureTextEntry
                    returnKeyType="done"
                    placeholder="Password"
                />
                <Button loading={loading} title="Login" onPress={login} />
            </ScrollView>
        </GradientBackground>
    );
}
