import type React from "react";

export interface ModelViewerElement extends HTMLElement {
  canActivateAR: boolean;
}

type ModelViewerAttributes = {
  src?: string;
  "ios-src"?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: string;
  "ar-placement"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "rotation-per-second"?: string;
  "touch-action"?: string;
  "interaction-prompt"?: string;
  "shadow-intensity"?: string;
  exposure?: string;
  "environment-image"?: string;
  alt?: string;
  class?: string;
  slot?: string;
  style?: React.CSSProperties;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<ModelViewerElement> & ModelViewerAttributes,
        ModelViewerElement
      >;
    }
  }
}
