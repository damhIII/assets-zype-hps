// Ajustes fijos del render (entrega.md): H.264, CRF 18, yuv420p, AAC.
import {Config} from "@remotion/cli/config";

Config.setEntryPoint("src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setAudioCodec("aac");
Config.setOverwriteOutput(true);
if (process.env.CHROME) {
  Config.setBrowserExecutable(process.env.CHROME);
  Config.setChromeMode("chrome-for-testing");
}
