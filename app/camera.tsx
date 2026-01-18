import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LucideX, LucideRefreshCcw, LucideImage, LucideCircle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

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

    if (!permission) return <View className="flex-1 bg-black" />;

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-zinc-900 p-6">
                <Text className="text-white text-center text-lg mb-6">We need your permission to show the camera</Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-brand-sage px-8 py-4 rounded-2xl"
                >
                    <Text className="text-white font-bold">Grant Permission</Text>
                </TouchableOpacity>
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
            mediaTypes: ImagePicker.MediaType.Images,
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
        <View style={StyleSheet.absoluteFill} className="bg-black">
            {/* Camera Feed */}
            <CameraView
                style={StyleSheet.absoluteFill}
                facing={facing}
                ref={cameraRef}
                mode="picture"
            />

            {/* UI Overlay - Using absolute positioning for high priority touch areas */}
            <SafeAreaView
                edges={['top']}
                style={styles.topControls}
                pointerEvents="box-none"
            >
                <View style={styles.headerRow} pointerEvents="box-none">
                    <TouchableOpacity
                        onPress={() => {
                            console.log("Cancel pressed - returning");
                            router.back();
                        }}
                        style={styles.controlCircle}
                        activeOpacity={0.6}
                    >
                        <LucideX color="white" size={26} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            console.log("Flip pressed");
                            toggleCameraFacing();
                        }}
                        style={styles.controlCircle}
                        activeOpacity={0.6}
                    >
                        <LucideRefreshCcw color="white" size={26} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <SafeAreaView
                edges={['bottom']}
                style={styles.bottomControls}
                pointerEvents="box-none"
            >
                <View style={styles.footerRow} pointerEvents="box-none">
                    {/* Gallery */}
                    <TouchableOpacity
                        onPress={pickImage}
                        style={styles.sideButton}
                        activeOpacity={0.6}
                    >
                        <LucideImage color="white" size={30} />
                        <Text style={styles.sideButtonText}>Library</Text>
                    </TouchableOpacity>

                    {/* Shutter */}
                    <TouchableOpacity
                        onPress={takePicture}
                        activeOpacity={0.8}
                        style={styles.shutterButton}
                    >
                        <View style={styles.shutterInner} />
                    </TouchableOpacity>

                    {/* Color Info */}
                    <View style={styles.sideButton}>
                        <View
                            style={[styles.colorPreview, { backgroundColor: selectedColor }]}
                        />
                        <Text style={styles.sideButtonText}>Active</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    topControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingTop: 24,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 60,
        paddingTop: 24,
    },
    controlCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    shutterButton: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 5,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    shutterInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        opacity: 0.9,
    },
    sideButton: {
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideButtonText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    colorPreview: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'white',
    }
});


