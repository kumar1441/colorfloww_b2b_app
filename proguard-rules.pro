# Proguard rules for Colorfloww

# Keep React Native and its internal classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.fbreact.** { *; }

# Keep Expo modules
-keep class expo.modules.** { *; }

# Keep your own application classes if needed
# -keep class com.nailay.colorfloww.** { *; }

# Remove logs in production (Optional but recommended for privacy/performance)
#-assumenosideeffects class android.util.Log {
#    public static *** d(...);
#    public static *** v(...);
#    public static *** i(...);
#    public static *** w(...);
#    public static *** e(...);
#}

# Avoid obfuscating certain standard classes if they cause issues
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# React Native Skia (Required)
-keep class com.shopify.reactnative.skia.** { *; }

# React Native Reanimated (Recommended to ensure compatibility)
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbo.** { *; }
