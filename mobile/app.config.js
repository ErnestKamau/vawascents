// Dynamic config (instead of app.json) so the Google Maps Android API key can be
// read from env instead of committed to git — it has to be baked into the native
// AndroidManifest at build time, so EXPO_PUBLIC_* runtime substitution won't reach it.
module.exports = {
  expo: {
    name: 'mobile',
    slug: 'mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',
    ios: {
      icon: './assets/expo.icon',
      bundleIdentifier: 'com.vawascents.app',
    },
    android: {
      package: 'com.vawascents.app',
      adaptiveIcon: {
        backgroundColor: '#180B33',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? '',
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#180B33',
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      ],
      'expo-font',
      'expo-web-browser',
      'expo-secure-store',
      '@react-native-community/datetimepicker',
      [
        'expo-maps',
        {
          requestLocationPermission: true,
          locationPermission: 'Allow VawaScents to use your location to find pickup points near you.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
