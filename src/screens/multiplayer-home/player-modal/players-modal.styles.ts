import { StyleSheet } from "react-native";
import { colors } from "@utils";
import { Dimensions } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("screen").height;

const styles = StyleSheet.create({
    modalContainer: {
        height: SCREEN_HEIGHT * 0.6,
        marginTop: SCREEN_HEIGHT * 0.4
    },
    searchContainer: {
        padding: 20,
        backgroundColor: colors.purple
    },
    playerItem: {
        backgroundColor: colors.darkPurple,
        borderTopWidth: 1,
        borderTopColor: colors.lightPurple,
        padding: 15,
        marginBottom: 20
    }
});
export default styles;
