import React from "react";
import Image from "next/image";

export const Blockchains = () => {
  return (
    <div className="wrap">
      <div className="ball">
        <Image src="/img/eth.svg" alt="Ethereum" width={78} height={78} />
      </div>
      <div className="ball">
        <Image src="/img/base.svg" alt="Ethereum" width={96} height={96} />
      </div>
      <div className="ball">
        <Image src="/img/polygon.svg" alt="Ethereum" width={82} height={82} />
      </div>
      <div className="ball">
        <Image src="/img/celo.svg" alt="Ethereum" width={76} height={76} />
      </div>
      <div className="ball">
        <Image src="/img/op.svg" alt="Ethereum" width={72} height={72} />
      </div>
      <div className="ball">
        <Image
          src="/img/arbitrum.svg"
          alt="Ethereum"
          width={96}
          height={96}
          className="w-full object-cover"
        />
      </div>
    </div>
  );
};
