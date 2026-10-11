import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
};

/** Official Google "G" mark — used only on "Continue with Google" per Google's branding guidelines. */
export function GoogleIcon({ size = 20 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <Path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07h-7.35v5.7C7.51 40.9 15.1 46 24 46z"
      />
      <Path
        fill="#FBBC05"
        d="M11.69 28.18c-.43-1.3-.69-2.69-.69-4.18s.25-2.88.69-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.9 2.34 9.88l7.35-5.7z"
      />
      <Path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.1 2 7.51 7.1 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </Svg>
  );
}
