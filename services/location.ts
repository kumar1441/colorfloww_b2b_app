import * as Location from 'expo-location';

export interface LocationData {
    city: string;
    zipcode: string;
    latitude?: number;
    longitude?: number;
}

/**
 * LocationService: Handles location-based operations including
 * reverse geocoding and zipcode validation.
 */
export const LocationService = {
    /**
     * Get city name from US zipcode using Zippopotam.us API
     */
    async getCityFromZipcode(zipcode: string): Promise<string | null> {
        try {
            // Validate zipcode format (US: 5 digits)
            if (!/^\d{5}$/.test(zipcode)) {
                return null;
            }

            const response = await fetch(`https://api.zippopotam.us/us/${zipcode}`);

            if (!response.ok) {
                console.log(`[LocationService] Invalid zipcode: ${zipcode}`);
                return null;
            }

            const data = await response.json();
            const city = data.places?.[0]?.['place name'];

            return city || null;
        } catch (error) {
            console.error('[LocationService] Error fetching city from zipcode:', error);
            return null;
        }
    },

    /**
     * Reverse geocode coordinates to get city and zipcode
     */
    async reverseGeocode(latitude: number, longitude: number): Promise<LocationData | null> {
        try {
            const [address] = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (!address) {
                console.log('[LocationService] No address found for coordinates');
                return null;
            }

            return {
                city: address.city || '',
                zipcode: address.postalCode || '',
                latitude,
                longitude
            };
        } catch (error) {
            console.error('[LocationService] Error reverse geocoding:', error);
            return null;
        }
    },

    /**
     * Get current location and reverse geocode to city/zipcode
     */
    async getCurrentLocationData(): Promise<LocationData | null> {
        try {
            // Get approximate location (low accuracy for privacy)
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low
            });

            return await this.reverseGeocode(
                location.coords.latitude,
                location.coords.longitude
            );
        } catch (error) {
            console.error('[LocationService] Error getting current location:', error);
            return null;
        }
    },

    /**
     * Validate US zipcode format
     */
    isValidZipcode(zipcode: string): boolean {
        return /^\d{5}$/.test(zipcode);
    }
};
