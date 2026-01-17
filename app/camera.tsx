import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

/**
 * CameraScreen provides the interface for capturing nail photos 
 * or picking them from the gallery.
 */
export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const params = useLocalSearchParams();
    const selectedColor = params.color as string || '#FF0000';

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                });
                if (photo) {
                    router.push({
                        pathname: "/result",
                        params: { imageUri: photo.uri, selectedColor }
                    });
                }
            } catch (e) {
                console.error("Capture Error:", e);
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            router.push({
                pathname: "/result",
                params: { imageUri: result.assets[0].uri, selectedColor }
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* 1. Camera Feed Layer */}
            <CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />

            {/* 2. UI Overlay Layer (Positioned absolutely over camera) */}
            <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
                <View style={styles.overlay} pointerEvents="box-none">
                    {/* Header Controls */}
                    <View style={styles.header} pointerEvents="box-none">
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Text style={styles.iconText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleCameraFacing} style={styles.iconButton}>
                            <Text style={styles.iconText}>Flip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.footer} pointerEvents="auto">
                        <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
                            <Text style={styles.galleryText}>Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={takePicture}
                            style={styles.captureButton}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>

                        <View style={styles.placeholder} />
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 24,
    },
    permissionText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    iconButton: {
        padding: 10,
    },
    iconText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 40,
        paddingTop: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    galleryButton: {
        padding: 10,
    },
    galleryText: {
        color: '#fff',
        fontSize: 16,
    },
    captureButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 6,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        opacity: 0.8,
    },
    placeholder: {
        width: 60,
    }
});
