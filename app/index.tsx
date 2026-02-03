import { Redirect } from 'expo-router';

/**
 * Simplified entry point - bypassing onboarding for debugging
 */
export default function Index() {
    return <Redirect href="/(main)/community" />;
}
