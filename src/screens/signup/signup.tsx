import React, { ReactElement, useRef, useState, useEffect } from "react";
import {
    Alert,
    ScrollView,
    TextInput as NativeTextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    TouchableOpacity
} from "react-native";
import styles from "./signup.sytles";
import { GradientBackground, TextInput, Button, Text } from "@components";
import { RouteProp } from "@react-navigation/native";
import { Auth } from "aws-amplify";
import { colors } from "@utils";
import OTPInput from "@twotalltotems/react-native-otp-input";
import { StackNavigationProp, useHeaderHeight } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";

type SignUpProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "SignUp">;
    route: RouteProp<StackNavigatorParams, "SignUp">;
};

export default function SignUp({
    navigation,
    route
}: SignUpProps): ReactElement {
    const unconfirmedUsername = route.params?.username;
    const headerHeight = useHeaderHeight();
    const passwordRef = useRef<NativeTextInput | null>(null);
    const emailRef = useRef<NativeTextInput | null>(null);
    const nameRef = useRef<NativeTextInput | null>(null);

    const [form, setForm] = useState({
        username: "test",
        email: "jona10@needlegqu.com",
        name: "Test Name",
        password: "12345678"
    });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"signUp" | "otp">(
        unconfirmedUsername ? "otp" : "signUp"
    );
    const [confirming, setConfirming] = useState(false);
    const [resending, setResending] = useState(false);

    const setFormInput = (key: keyof typeof form, value: string): void => {
        setForm({ ...form, [key]: value });
    };

    const signUp = async () => {
        setLoading(true);
        const { username, password, email, name } = form;
        try {
            await Auth.signUp({
                username,
                password,
                attributes: {
                    email,
                    name
                }
            });
            setStep("otp");
        } catch (error) {
            console.log(error);
            Alert.alert("Error!", error.message || "An error occurred!");
        }

        setLoading(false);
    };

    const confirmCode = async (code: string) => {
        setConfirming(true);
        try {
            await Auth.confirmSignUp(
                form.username || unconfirmedUsername || "",
                code
            );
            navigation.navigate("Login");
            Alert.alert("Success!", "You can now login with your account.");
        } catch (error) {
            Alert.alert("Error!", error.message || "An error occurred!");
        }
        setConfirming(false);
    };

    const resendCode = async (username: string) => {
        setResending(true);
        try {
            await Auth.resendSignUp(username);
        } catch (error) {
            Alert.alert("Error!", error.message || "An error occurred!");
        }
        setResending(false);
    };

    useEffect(() => {
        if (unconfirmedUsername) {
            resendCode(unconfirmedUsername);
        }
    }, [unconfirmedUsername]);

    return (
        <GradientBackground>
            <KeyboardAvoidingView
                keyboardVerticalOffset={headerHeight}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    {step === "otp" && (
                        <>
                            <Text style={styles.otpText}>
                                Enter the code that yor received via email.
                            </Text>
                            {confirming ? (
                                <ActivityIndicator color={colors.lightGreen} />
                            ) : (
                                <>
                                    <OTPInput
                                        style={{ height: 100 }}
                                        placeholderCharacter="0"
                                        placeholderTextColor="#5d5379"
                                        codeInputFieldStyle={styles.otpInputBox}
                                        codeInputHighlightStyle={
                                            styles.otpActiveInputBox
                                        }
                                        pinCount={6}
                                        onCodeFilled={code => {
                                            confirmCode(code);
                                        }}
                                    />
                                    {resending ? (
                                        <ActivityIndicator
                                            color={colors.lightGreen}
                                        />
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (form.username) {
                                                    resendCode(form.username);
                                                }
                                                if (unconfirmedUsername) {
                                                    resendCode(
                                                        unconfirmedUsername
                                                    );
                                                }
                                            }}
                                        >
                                            <Text style={styles.resendLink}>
                                                Recend Code
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </>
                    )}
                    {step === "signUp" && (
                        <>
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
                                    emailRef.current?.focus();
                                }}
                            />
                            <TextInput
                                ref={nameRef}
                                returnKeyType="next"
                                placeholder="Name"
                                value={form.name}
                                onChangeText={value => {
                                    setFormInput("name", value);
                                }}
                                style={{
                                    marginBottom: 20
                                }}
                                onSubmitEditing={() => {
                                    nameRef.current?.focus();
                                }}
                            />
                            <TextInput
                                keyboardType="email-address"
                                ref={emailRef}
                                returnKeyType="next"
                                placeholder="Email"
                                value={form.email}
                                onChangeText={value => {
                                    setFormInput("email", value);
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
                            <Button
                                loading={loading}
                                title="Sign-Up"
                                onPress={signUp}
                            />
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}
