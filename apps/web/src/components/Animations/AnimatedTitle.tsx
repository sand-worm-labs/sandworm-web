import { useEffect } from "react";
import { useAnimation, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type AnimatedTitleProps = {
  text: string;
  className: string;
  wordSpace: string;
  charSpace: string;
};

export default function AnimatedTitle({
  text,
  className,
  wordSpace,
  charSpace,
}: AnimatedTitleProps) {
  const ctrls = useAnimation();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    ctrls.start(inView ? "visible" : "hidden");
  }, [ctrls, inView]);

  const wordAnimation = { hidden: {}, visible: {} };
  const characterAnimation = {
    hidden: { opacity: 0, y: "0.25em" },
    visible: {
      opacity: 1,
      y: "0em",
      transition: { duration: 1, ease: [0.2, 0.65, 0.3, 0.9] },
    },
  };

  return (
    <h2 aria-label={text} className={className}>
      {text.split(" ").map(word => (
        <motion.span
          ref={ref}
          aria-hidden="true"
          key={word}
          initial="hidden"
          animate={ctrls}
          variants={wordAnimation}
          transition={{
            delayChildren: 0.25,
            staggerChildren: 0.05,
          }}
          className={`inline-block whitespace-nowrap font-secondary ${wordSpace}`}
        >
          {word.split("").map((char, cIdx) => (
            <motion.span
              aria-hidden="true"
              key={`${word}-${char}-${cIdx.toString()}`}
              variants={characterAnimation}
              className={`inline-block ${charSpace}`}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </h2>
  );
}
