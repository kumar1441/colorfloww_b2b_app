import React from 'react';
import { Canvas, Path, Image, useImage, Skia, Group } from "@shopify/react-native-skia";
// import { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { View, useWindowDimensions, StyleSheet } from "react-native";
import { Nail } from "../services/nailDetection";

interface Props {
    imageUri: string;
    nails: Nail[];
    selectedColor: string;
}

/**
 * Renders the virtual nail polish using Skia for high-performance blending.
 */
export function NailOverlaySkia({ imageUri, nails, selectedColor }: Props) {
    const { width, height } = useWindowDimensions();
    const image = useImage(imageUri);

    if (!image) {
        return <View style={styles.placeholder} />;
    }

    // Coordinates align with the image aspect ratio
    const canvasWidth = width;
    const canvasHeight = height;

    return (
        <Canvas style={styles.canvas}>
            {/* Base Image */}
            <Image
                image={image}
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fit="contain"
            />
            {/* Polished Nails */}
            {nails.map((nail, index) => {
                const path = Skia.Path.MakeFromSVGString(nail.mask);
                if (!path) return null;

                return (
                    <Group key={index}>
                        {/* 1. Base Layer: Multiply preserves the underlying nail texture/shadows */}
                        <Path path={path} color={selectedColor} blendMode="multiply" />

                        {/* 2. Color Pop: Overlay adds vibrancy */}
                        <Path path={path} color={selectedColor} blendMode="overlay" opacity={0.5} />

                        {/* 3. Gloss Layer: Screen adds realistic highlights */}
                        <Path path={path} color="white" blendMode="screen" opacity={0.1} />
                    </Group>
                );
            })}
        </Canvas>
    );
}

const styles = StyleSheet.create({
    canvas: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#000',
    }
});
