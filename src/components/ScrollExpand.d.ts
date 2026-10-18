import type { CSSProperties, ReactNode } from "react";

export interface ScrollExpandProps {
  src?: string;
  mediaType?: "image" | "video";
  poster?: string;
  alt?: string;
  title?: ReactNode;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  /** Progress at which the title starts fading out (0 = start, 1 = fully expanded). */
  titleFadeStart?: number;
  /** Progress at which the title finishes fading out. */
  titleFadeEnd?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

declare function ScrollExpand(props: ScrollExpandProps): React.JSX.Element;

export default ScrollExpand;
