import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const GAME_WIDTH = width * 0.9;
export const GAME_HEIGHT = Math.min(height * 0.5, 400);
export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 50;
export const FRAME_MS = 1000 / 60; // 60 fps constant

