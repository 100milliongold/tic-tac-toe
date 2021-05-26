import React, { ReactNode, ReactElement, useState, useEffect } from "react";
import {} from "react-native";
import AppLoading from "expo-app-loading";

import {
    useFonts,
    DeliusUnicase_400Regular,
    DeliusUnicase_700Bold
} from "@expo-google-fonts/delius-unicase";

import { Auth } from "aws-amplify";

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

    const [authLoaded, setAuthLoaded] = useState(false)

    useEffect(() => {
        async function checkCurrentUser() {
            try {
                const user = await Auth.currentAuthenticatedUser();
                console.log(user);
            } catch (error) {
                console.log(error);
            }
        }
        setAuthLoaded(true)
        checkCurrentUser()
    }, [])


    return fontLoaded && authLoaded ? <>{children}</> : <AppLoading />;
}
