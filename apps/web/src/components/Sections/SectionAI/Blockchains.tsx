import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const Blockchains = () => {
  const blockchains = [
    {
      src: "/img/eth.svg",
      alt: "Ethereum",
      width: 78,
      height: 78,
      rotate: -15,
      marginLeft: "0%",
      finalBottom: -30,
    },
    {
      src: "/img/base.svg",
      alt: "Base",
      width: 96,
      height: 96,
      rotate: -5,
      marginLeft: "20%",
      finalBottom: 30,
    },
    {
      src: "/img/polygon.svg",
      alt: "Polygon",
      width: 82,
      height: 82,
      rotate: 12,
      marginLeft: "40%",
      finalBottom: 30,
    },
    {
      src: "/img/celo.svg",
      alt: "Celo",
      width: 80,
      height: 80,
      rotate: 10,
      marginLeft: "60%",
      finalBottom: -30,
    },
    {
      src: "/img/op.svg",
      alt: "Optimism",
      width: 72,
      height: 72,
      rotate: 2,
      marginLeft: "80%",
      finalBottom: -30,
    },
    {
      src: "/img/arbitrum.svg",
      alt: "Arbitrum",
      width: 96,
      height: 96,
      rotate: -15,
      marginLeft: "100%",
      finalBottom: 30,
    },
  ];

  const createBounceVariants = (delay: number, finalBottom: number) => ({
    hidden: {
      y: 0,
      opacity: 0,
    },
    visible: {
      y: [0, -100, finalBottom],
      opacity: 1,
      transition: {
        duration: 1.5,
        delay,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        opacity: {
          duration: 0.3,
          delay,
        },
      },
    },
  });

  return (
    <div className="absolute left-[-120px] right-0 mx-auto h-[150px] w-[850px] top-[10%] bg-black">
      {blockchains.map((chain, index) => {
        const delay = index * 0.4;

        return (
          <motion.div
            key={index}
            className="absolute bottom-[10px] flex items-center justify-center h-24 w-24 bg-white rounded-[1.2rem]"
            style={{
              marginLeft: chain.marginLeft,
              rotate: `${chain.rotate}deg`,
            }}
            variants={createBounceVariants(delay, chain.finalBottom)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Image
              src={chain.src}
              alt={chain.alt}
              width={chain.width}
              height={chain.height}
              className="object-contain"
            />
          </motion.div>
        );
      })}
    </div>
  );
};
