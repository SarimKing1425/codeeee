import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily, waitUntilDone } = loadFont();

export const FONT = fontFamily;
export { waitUntilDone };
