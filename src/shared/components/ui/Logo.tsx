import { FC } from 'react';

interface LogoProps {
  size?: number;
  className?: string
}

export const Logo: FC<LogoProps> = ({ size = 24, className='' }) => {
  return (
    <svg
      width={size * 1.163323782}
      height={size}
      className={`${className}`}
      viewBox="0 0 406 349"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M233.809 30.4213C233.809 47.2225 220.204 60.8426 203.422 60.8426C186.64 60.8426 173.035 47.2225 173.035 30.4213C173.035 13.6201 186.64 0 203.422 0C220.204 0 233.809 13.6201 233.809 30.4213Z"
        fill="url(#paint0_linear_24_10)"
      />
      <path
        d="M406 318.579C406 335.38 392.395 349 375.613 349C358.831 349 345.227 335.38 345.227 318.579C345.227 301.777 358.831 288.157 375.613 288.157C392.395 288.157 406 301.777 406 318.579Z"
        fill="url(#paint1_linear_24_10)"
      />
      <path
        d="M60.7734 318.579C60.7734 335.38 47.1688 349 30.3867 349C13.6046 349 0 335.38 0 318.579C0 301.777 13.6046 288.157 30.3867 288.157C47.1688 288.157 60.7734 301.777 60.7734 318.579Z"
        fill="url(#paint2_linear_24_10)"
      />
      <path
        d="M203.422 50.7022C203.422 50.7022 203.9 153.462 236.587 207.598C269.275 261.733 362.108 313.508 362.108 313.508C362.108 313.508 268.798 262.524 203.422 262.524C138.046 262.524 44.736 313.508 44.736 313.508C44.736 313.508 137.569 261.733 170.257 207.598C202.944 153.462 203.422 50.7022 203.422 50.7022Z"
        fill="url(#paint3_linear_24_10)"
      />
      <path
        d="M297.959 133.516C297.959 133.516 300.678 156.29 310.105 166.015C319.024 175.217 340.162 179.148 340.162 179.148C340.162 179.148 319.024 183.079 310.105 192.28C300.678 202.005 297.959 224.78 297.959 224.78C297.959 224.78 295.239 202.005 285.813 192.28C276.894 183.079 255.755 179.148 255.755 179.148C255.755 179.148 276.894 175.217 285.813 166.015C295.239 156.29 297.959 133.516 297.959 133.516Z"
        fill="url(#paint4_linear_24_10)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_24_10"
          x1="196.248"
          y1="7.60534"
          x2="383.96"
          y2="348.82"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#1267DD" />
          <stop offset="0.815967" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_24_10"
          x1="196.248"
          y1="7.60534"
          x2="383.96"
          y2="348.82"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#1267DD" />
          <stop offset="0.815967" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_24_10"
          x1="196.248"
          y1="7.60534"
          x2="383.96"
          y2="348.82"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#1267DD" />
          <stop offset="0.815967" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_24_10"
          x1="196.248"
          y1="7.60534"
          x2="383.96"
          y2="348.82"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#1267DD" />
          <stop offset="0.815967" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_24_10"
          x1="196.248"
          y1="7.60534"
          x2="383.96"
          y2="348.82"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#1267DD" />
          <stop offset="0.815967" stopColor="white" />
        </linearGradient>
      </defs>
    </svg>
  );
};
