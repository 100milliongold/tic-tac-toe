import React, { createContext, useContext } from "react";

const SettingsContext = createContext({
    settings: {
        sound: true
    }
});

function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingProvider.");
    }
    return context;
}

function SettingProvider(props) {
    return (
        <SettingsContext.Provider
            {...props}
            value={{
                settings: {
                    sound: true
                }
            }}
        />
    );
}

export { useSettings, SettingProvider };
