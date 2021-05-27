import React, { ReactElement, useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    TextInput as NativeTextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from "react-native";
import styles from "./signup.sytles";
import { GradientBackground, TextInput, Button, Text } from "@components";
import { Auth } from "aws-amplify";
import { colors } from "@utils";
import OTPInput from "@twotalltotems/react-native-otp-input";
import { StackNavigationProp, useHeaderHeight } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";

type SignUpProps = {
    navigation: StackNavigationProp<StackNavigatorParams, "SignUp">;
};

export default function SignUp({ navigation }: SignUpProps): ReactElement {
    const headerHeight = useHeaderHeight();
    const passwordRef = useRef<NativeTextInput | null>(null);
    const emailRef = useRef<NativeTextInput | null>(null);
    const nameRef = useRef<NativeTextInput | null>(null);

    const [form, setForm] = useState({
        username: "test",
        email: "keishawn@needlegqu.com",
        name: "Test Name",
        password: "12345678"
    });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"signUp" | "otp">("signUp");
    const [confirming, setConfirming] = useState(false);

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
            await Auth.confirmSignUp(form.username, code);
            navigation.navigate("Login");
            Alert.alert("Success!", "You can now login with your account.");
        } catch (error) {
            Alert.alert("Error!", error.message || "An error occurred!");
        }
        setConfirming(false);
    };

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
                                <OTPInput
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
