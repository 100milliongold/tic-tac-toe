import React, { ReactNode, ReactElement } from "react";
import {} from "react-native";
import AppLoading from "expo-app-loading";

import {
    useFonts,
    DeliusUnicase_400Regular,
    DeliusUnicase_700Bold
} from "@expo-google-fonts/delius-unicase";

type AppBootstrapProps = {
    children: ReactNode;
};

export default function AppBootstrap({
    children
}: AppBootstrapProps): ReactElement {
    const [fontLoaded] = useFonts({
        DeliusUnicase_400Regular,
        DeliusUnicase_700Bold
    });
    return fontLoaded ? <>{children}</> : <AppLoading />;
}
