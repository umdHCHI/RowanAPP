//Main background for the game screens

import {
    ImageBackground,
    StyleSheet,
    View,
} from 'react-native'

const hauntedLibraryBackground = require('../../assets/UI/hauntedlibrary.png')

export function GameBackground() {
    return (
        <ImageBackground
            source={hauntedLibraryBackground}
            resizeMode="cover"
            style={styles.background}
         
        >
            <View style={styles.overlay} />
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
})