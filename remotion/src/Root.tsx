import React from "react";
import {Composition} from "remotion";
import {brief} from "./kit/brief";
import {Reel} from "./Reel";

export const Root: React.FC = () => (
  <Composition
    id="Reel-es"
    component={Reel}
    durationInFrames={brief.video.frames}
    fps={brief.video.fps}
    width={brief.video.width}
    height={brief.video.height}
  />
);
