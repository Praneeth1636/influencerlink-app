import type { SVGProps } from "react";

type TerraceIconProps = SVGProps<SVGSVGElement> & {
  accent?: string;
};

function IconFrame({ children, accent = "currentColor", ...props }: TerraceIconProps) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M5.4 4.4h13.2c.55 0 1 .45 1 1v13.2c0 .55-.45 1-1 1H5.4c-.55 0-1-.45-1-1V5.4c0-.55.45-1 1-1Z"
        fill="currentColor"
        opacity="0.13"
      />
      {children}
      <circle cx="18.2" cy="5.8" r="1.45" fill={accent} />
    </svg>
  );
}

export function TerraceFeedIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M7.2 8.1c0-.5.4-.9.9-.9h7.8c.5 0 .9.4.9.9v1.6c0 .5-.4.9-.9.9H8.1c-.5 0-.9-.4-.9-.9V8.1Z"
        fill="currentColor"
      />
      <path
        d="M7.2 13.2c0-.5.4-.9.9-.9h4.9c.5 0 .9.4.9.9v2.7c0 .5-.4.9-.9.9H8.1c-.5 0-.9-.4-.9-.9v-2.7Z"
        fill="currentColor"
        opacity="0.72"
      />
      <path
        d="M15.2 13.2c0-.5.4-.9.9-.9h.9c.5 0 .9.4.9.9v2.7c0 .5-.4.9-.9.9h-.9c-.5 0-.9-.4-.9-.9v-2.7Z"
        fill="currentColor"
        opacity="0.42"
      />
    </IconFrame>
  );
}

export function TerraceSearchIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="10.7" cy="10.7" r="3.35" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="m13.4 13.5 3.4 3.4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path
        d="m16.2 7.2.45 1.05 1.05.45-1.05.45-.45 1.05-.45-1.05-1.05-.45 1.05-.45.45-1.05Z"
        fill={props.accent ?? "currentColor"}
      />
    </IconFrame>
  );
}

export function TerraceRanksIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M7.1 15.5c0-.5.4-.9.9-.9h2.1v3.2h-3v-2.3Z" fill="currentColor" opacity="0.55" />
      <path d="M10.5 10.1c0-.5.4-.9.9-.9h1.2c.5 0 .9.4.9.9v7.7h-3v-7.7Z" fill="currentColor" />
      <path d="M13.9 12.6c0-.5.4-.9.9-.9h1.2c.5 0 .9.4.9.9v5.2h-3v-5.2Z" fill="currentColor" opacity="0.72" />
      <path
        d="m12 5.7.52 1.05 1.16.17-.84.82.2 1.15L12 8.35l-1.04.55.2-1.15-.84-.82 1.16-.17L12 5.7Z"
        fill={props.accent ?? "currentColor"}
      />
    </IconFrame>
  );
}

export function TerraceBriefsIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M8.9 8.4V7.2c0-.55.45-1 1-1h4.2c.55 0 1 .45 1 1v1.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.8 9.1h10.4c.55 0 1 .45 1 1v6.2c0 .55-.45 1-1 1H6.8c-.55 0-1-.45-1-1v-6.2c0-.55.45-1 1-1Z"
        fill="currentColor"
      />
      <path d="M5.8 12.2h12.4" stroke="white" strokeOpacity="0.55" strokeWidth="1.4" />
      <rect x="10.3" y="11.25" width="3.4" height="2.2" rx="0.8" fill={props.accent ?? "white"} />
    </IconFrame>
  );
}

export function TerraceMessagesIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M6.8 7.3h7.9c.65 0 1.18.53 1.18 1.18v4.2c0 .65-.53 1.18-1.18 1.18h-4.7l-2.45 2.1v-2.1H6.8c-.65 0-1.18-.53-1.18-1.18v-4.2c0-.65.53-1.18 1.18-1.18Z"
        fill="currentColor"
      />
      <path
        d="M12.8 10.8h4.4c.62 0 1.12.5 1.12 1.12v3.18c0 .62-.5 1.12-1.12 1.12h-.72v1.65l-1.9-1.65H11.9c-.62 0-1.12-.5-1.12-1.12v-.65"
        fill={props.accent ?? "currentColor"}
        opacity="0.72"
      />
    </IconFrame>
  );
}

export function TerraceNotificationsIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M8.1 15.4h7.8l-.82-1.38c-.42-.7-.64-1.5-.64-2.32V10.5a4.44 4.44 0 0 0-8.88 0v1.2c0 .82-.22 1.62-.64 2.32L4.1 15.4h4Z"
        fill="currentColor"
      />
      <path
        d="M10 17.05c.34.68 1.03 1.12 2 1.12s1.66-.44 2-1.12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
      <path
        d="M16.1 6.2c.88.46 1.56 1.22 1.92 2.12"
        stroke={props.accent ?? "currentColor"}
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </IconFrame>
  );
}

export function TerraceAnalyticsIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M7.4 16.9V12" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      <path d="M12 16.9V7.7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      <path d="M16.6 16.9v-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      <path d="M6.5 16.9h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.42" />
      <circle cx="16.6" cy="8.2" r="1.45" fill={props.accent ?? "currentColor"} />
    </IconFrame>
  );
}

export function TerraceProfileIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="9.2" r="3" fill="currentColor" />
      <path d="M6.6 17.6c.62-2.46 2.56-4.02 5.4-4.02s4.78 1.56 5.4 4.02" fill="currentColor" opacity="0.72" />
      <path
        d="m16 6.4.38.78.86.12-.62.6.15.85L16 8.35l-.77.4.15-.85-.62-.6.86-.12L16 6.4Z"
        fill={props.accent ?? "currentColor"}
      />
    </IconFrame>
  );
}

export function TerraceSavedIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M8.1 6.4h7.8c.55 0 1 .45 1 1v10.1l-4.9-2.6-4.9 2.6V7.4c0-.55.45-1 1-1Z" fill="currentColor" />
      <path d="M10 9.5h4" stroke={props.accent ?? "white"} strokeLinecap="round" strokeWidth="1.6" />
    </IconFrame>
  );
}

export function TerraceSettingsIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M7 8h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M7 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.72" />
      <path d="M7 16h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.48" />
      <circle cx="10" cy="8" r="1.7" fill={props.accent ?? "currentColor"} />
      <circle cx="14.2" cy="12" r="1.7" fill={props.accent ?? "currentColor"} />
      <circle cx="11.7" cy="16" r="1.7" fill={props.accent ?? "currentColor"} />
    </IconFrame>
  );
}

export function TerraceSparkIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 5.6 13.28 9 16.8 10.2l-3.52 1.2L12 14.8l-1.28-3.4L7.2 10.2 10.72 9 12 5.6Z" fill="currentColor" />
      <path
        d="m16.2 13.4.55 1.38 1.45.52-1.45.52-.55 1.38-.55-1.38-1.45-.52 1.45-.52.55-1.38Z"
        fill={props.accent ?? "currentColor"}
      />
      <path d="m7.8 14.1.4 1 .98.36-.98.36-.4 1-.4-1-.98-.36.98-.36.4-1Z" fill="currentColor" opacity="0.58" />
    </IconFrame>
  );
}

export function TerraceReadyIcon(props: TerraceIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 18.2a6.2 6.2 0 1 0 0-12.4 6.2 6.2 0 0 0 0 12.4Z" fill="currentColor" opacity="0.2" />
      <path
        d="m8.7 12.1 2.05 2.05 4.55-5.05"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      />
      <circle cx="17.2" cy="7" r="1.45" fill={props.accent ?? "currentColor"} />
    </IconFrame>
  );
}
