import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="#4648d4"
          style={{ display: 'block' }}
        >
          <path d="M19 9l-1.41-3.12L14.47 4.5l3.12-1.38L19 0l1.41 3.12 3.12 1.38-3.12 3.12L19 9zm0 8l1.41 3.12 3.12 1.38-3.12 1.38L19 26l-1.41-3.12-3.12-1.38 3.12-3.12L19 17zM11.5 5.5L9 11 3.5 13.5 9 16l2.5 5.5 2.5-5.5 5.5-2.5L14 11l-2.5-5.5z" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
