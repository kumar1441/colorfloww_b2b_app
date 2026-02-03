import React from 'react';
import { Canvas, Path, Image, useImage, Skia, Group, BlurMask, SkImage } from "@shopify/react-native-skia";
import { View, StyleSheet } from "react-native";
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
    const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });
    const [image, setImage] = React.useState<SkImage | null>(null);

    React.useEffect(() => {
        let isMounted = true;
        const loadImage = async () => {
            if (!imageUri) {
                console.warn("[NailOverlay] No imageUri provided");
                return;
            }
            try {
                // Method 3: Fetch API (Standard, Native)
                // This bypasses expo-file-system and uses the native bridge to read the file
                const response = await fetch(imageUri);
                const buffer = await response.arrayBuffer();
                const bytes = new Uint8Array(buffer);
                const data = Skia.Data.fromBytes(bytes);

                if (!data) {
                    console.error("[NailOverlay] Failed to create SkData from bytes");
                    return;
                }

                const img = Skia.Image.MakeImageFromEncoded(data);

                if (img) {
                    if (isMounted) {
                        setImage(img);
                    }
                } else {
                    console.error("[NailOverlay] Failed to create SkImage from encoded data");
                }
            } catch (e) {
                console.error("[NailOverlay] Error loading image:", e);
                // @ts-ignore
                if (e?.stack) console.error(e.stack);
            }
        };

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [imageUri]);

    if (!image) {
        return <View style={styles.placeholder} />;
    }

    // Original image dimensions
    const imgWidth = image.width();
    const imgHeight = image.height();

    // Scale calculation for "contain" fit relative to container
    const { width: containerWidth, height: containerHeight } = containerSize;

    if (containerWidth === 0 || containerHeight === 0) {
        return (
            <View
                style={styles.canvas}
                onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    setContainerSize({ width, height });
                }}
            />
        );
    }

    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = imgWidth / imgHeight;

    let scaledWidth = containerWidth;
    let scaledHeight = containerHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container
        scaledHeight = containerWidth / imageAspectRatio;
        offsetY = (containerHeight - scaledHeight) / 2;
    } else {
        // Image is taller than container
        scaledWidth = containerHeight * imageAspectRatio;
        offsetX = (containerWidth - scaledWidth) / 2;
    }

    const scale = scaledWidth / imgWidth;

    return (
        <View
            style={styles.canvas}
            onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width !== containerSize.width || height !== containerSize.height) {
                    setContainerSize({ width, height });
                }
            }}
        >
            <Canvas style={styles.canvas}>
                {/* Base Image */}
                <Image
                    image={image}
                    x={offsetX}
                    y={offsetY}
                    width={scaledWidth}
                    height={scaledHeight}
                    fit="fill"
                />
                {/* Polished Nails */}
                {nails.map((nail, index) => {
                    const path = Skia.Path.MakeFromSVGString(nail.mask);
                    if (!path) return null;

                    // Scale the path to match the displayed image
                    const matrix = Skia.Matrix();
                    matrix.translate(offsetX, offsetY);
                    matrix.scale(scale, scale);
                    path.transform(matrix);

                    return (
                        <Group key={index}>
                            {/* 1. Base Layer: Multiply preserves the underlying nail texture/shadows */}
                            <Path path={path} color={selectedColor} blendMode="multiply" opacity={0.8}>
                                <BlurMask blur={1.5} style="normal" />
                            </Path>

                            {/* 2. Color Pop: Overlay/SoftLight adds vibrancy while respecting texture */}
                            <Path path={path} color={selectedColor} blendMode="softLight" opacity={0.6}>
                                <BlurMask blur={1.5} style="normal" />
                            </Path>

                            {/* 3. Gloss Layer: Screen adds realistic highlights */}
                            <Path path={path} color="white" blendMode="screen" opacity={0.15}>
                                <BlurMask blur={2} style="normal" />
                            </Path>
                        </Group>
                    );
                })}
            </Canvas>
        </View>
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
