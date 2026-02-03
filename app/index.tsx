import { Redirect } from 'expo-router';

/**
 * Entry point redirecting users to the Home screen for guest browsing.
 */
export default function Index() {
    return <Redirect href="/(main)/community" />;
}
