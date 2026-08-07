"use client";

import React from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

export default function LottieAnimation() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <DotLottiePlayer
        src="https://assets9.lottiefiles.com/packages/lf20_sk5h1kfn.json"
        background="transparent"
        speed={1}
        loop
        autoplay
      />
    </div>
  );
}
