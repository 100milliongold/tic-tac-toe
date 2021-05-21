import React, { ReactElement } from "react";
import { ScrollView } from "react-native";
import { GradientBackground, Text } from "@components";
import setting from "./setting.style";

export default function Settings(): ReactElement {
    return (
        <GradientBackground>
            <ScrollView contentContainerStyle={setting.container}>
                <Text>Settings</Text>
            </ScrollView>
        </GradientBackground>
    );
}
