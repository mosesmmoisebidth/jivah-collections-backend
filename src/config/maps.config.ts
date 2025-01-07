import { ConfigType, registerAs } from '@nestjs/config';

export const mapRegToken = 'maps';

export const MapsConfig = registerAs(mapRegToken, () => ({
    maps_key: process.env.BING_MAPS_API_KEY,
}))
export type IMapConfig = ConfigType<typeof MapsConfig>;

