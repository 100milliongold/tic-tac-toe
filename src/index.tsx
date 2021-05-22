import React, { ReactElement } from "react";
import { AppBootstrap } from "@components";
import Navigator from "@config/navigator";
import { SettingProvider } from "@contexts/settings-context";
import Amplify from "aws-amplify";
import config from "./aws-exports";

Amplify.configure(config);

export default function App(): ReactElement {
    return (
        <AppBootstrap>
            <SettingProvider>
                <Navigator />
            </SettingProvider>
        </AppBootstrap>
    );
}
