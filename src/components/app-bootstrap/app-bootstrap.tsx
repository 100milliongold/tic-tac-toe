import React, { ReactNode, ReactElement, useState, useEffect } from "react";
import {} from "react-native";
import AppLoading from "expo-app-loading";
import {
    useFonts,
    DeliusUnicase_400Regular,
    DeliusUnicase_700Bold
} from "@expo-google-fonts/delius-unicase";
import { Auth, Hub } from "aws-amplify";
import { useAuth } from "@contexts/auth-context";
import { initNotifications } from "@utils";
import * as Notifications from "expo-notifications";

/**
 * 환경설정
 * shouldShowAlert : 실행중인데도 알람표시
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
    })
});

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

    const [authLoaded, setAuthLoaded] = useState(false);
    const { setUser } = useAuth();

    useEffect(() => {
        async function checkCurrentUser() {
            try {
                const user = await Auth.currentAuthenticatedUser();
                setUser(user);
                initNotifications();
            } catch (error) {
                setUser(null);
            }
        }
        setAuthLoaded(true);
        checkCurrentUser();

        function hubListener(hubData: any) {
            const { data, event } = hubData.payload;
            switch (event) {
                case "signOut":
                    setUser(null);
                    break;
                case "signIn":
                    setUser(data);
                    initNotifications();
                    break;
                default:
                    break;
            }
        }
        Hub.listen("auth", hubListener);

        return () => {
            Hub.remove("auth", hubListener);
        };
    }, []);

    return fontLoaded && authLoaded ? <>{children}</> : <AppLoading />;
}
