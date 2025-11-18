import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

const ROTATION_RANGE = 20;
const HALF_ROTATION = ROTATION_RANGE / 2;

export const TiltWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ref = useRef<HTMLDivElement | null>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 150, damping: 12 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 12 });

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        const mouseX = ((e.clientX - rect.left) / rect.width) * ROTATION_RANGE;
        const mouseY = ((e.clientY - rect.top) / rect.height) * ROTATION_RANGE;

        x.set((mouseY - HALF_ROTATION) * -1);
        y.set(mouseX - HALF_ROTATION);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={() => {
                x.set(0);
                y.set(0);
            }}
            style={{
                transformStyle: "preserve-3d",
                transform,
            }}
        >
            {children}
        </motion.div>
    );
};
