import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";

const input = "video/Video Project.mp4";
const output = "public/video/background-web.mp4";

const args = [
  "-y",
  "-i", input,
  "-an",
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-profile:v", "main",
  "-level", "4.0",
  "-movflags", "+faststart",
  "-vf", "scale='min(1920,iw)':-2",
  "-preset", "veryfast",
  "-crf", "24",
  output,
];

const proc = spawn(ffmpegPath, args, { stdio: "inherit" });
proc.on("exit", (code) => process.exit(code ?? 1));
