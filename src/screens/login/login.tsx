import React, { ReactElement, useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    TextInput as NativeTextInput,
    TouchableOpacity
} from "react-native";
import styles from "./login.sytles";
import { GradientBackground, TextInput, Button, Text } from "@components";
import { Auth } from "aws-amplify";
import { colors } from "@utils";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";

type LoginProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "Login">;
};

export default function Login({ navigation }: LoginProps): ReactElement {
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
        // console.log(username, password);

        try {
            await Auth.signIn(username, password);
            navigation.navigate("Home");
        } catch (error) {
            // console.log(error);
            if (error.code === "UserNotConfirmedException") {
                navigation.navigate("SignUp", { username });
            } else {
                Alert.alert("Error!", error.message || "An error occurred!");
            }
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
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("ForgotPassword");
                    }}
                >
                    <Text style={styles.forgotPasswordLink}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>

                <Button loading={loading} title="Login" onPress={login} />

                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("SignUp");
                    }}
                >
                    <Text style={styles.registerLink}>
                        Don&apos;t have an account?
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </GradientBackground>
    );
}
