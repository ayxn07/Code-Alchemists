"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCursor } from "@/src/components/context/CursorContext";

export default function AnimatedCursor() {
    const { isHovered, setIsHovered } = useCursor();
    const [isSmallDevice, setIsSmallDevice] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const dotSpringConfig = { damping: 15, stiffness: 150 };
    const dotX = useSpring(cursorX, dotSpringConfig);
    const dotY = useSpring(cursorY, dotSpringConfig);

    useEffect(() => {
        // Hide cursor on small devices
        const checkDevice = () => {
            setIsSmallDevice(window.innerWidth < 768);
        };
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    useEffect(() => {
        if (isSmallDevice) return;

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        window.addEventListener("mousemove", moveCursor);

        const updateInteractiveElements = () => {
            const interactiveElements = document.querySelectorAll(
                'a, button, input, textarea, select, [role="button"], .cursor-pointer, [onclick]'
            );

            interactiveElements.forEach((el) => {
                el.addEventListener("mouseenter", handleMouseEnter);
                el.addEventListener("mouseleave", handleMouseLeave);
            });

            return interactiveElements;
        };

        let interactiveElements = updateInteractiveElements();

        const intervalId = setInterval(() => {
            interactiveElements.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
            interactiveElements = updateInteractiveElements();
        }, 1000);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            clearInterval(intervalId);
            interactiveElements.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, [cursorX, cursorY, isSmallDevice, setIsHovered]);

    if (isSmallDevice) return null;

    return (
        <>
            <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

            {/* Outer ring */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 mix-blend-screen"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    zIndex: 99999,
                }}
            >
                <motion.div
                    animate={{
                        width: isHovered ? 60 : 32,
                        height: isHovered ? 60 : 32,
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 400 }}
                    className="rounded-full border-2"
                    style={{
                        borderColor: "#65cae1",
                        background: isHovered
                            ? "radial-gradient(circle, rgba(101, 202, 225, 0.3) 0%, rgba(77, 184, 212, 0.15) 50%, transparent 100%)"
                            : "radial-gradient(circle, rgba(101, 202, 225, 0.15) 0%, transparent 100%)",
                        boxShadow: isHovered
                            ? "0 0 30px rgba(101, 202, 225, 0.5), inset 0 0 20px rgba(101, 202, 225, 0.3)"
                            : "0 0 15px rgba(101, 202, 225, 0.3), inset 0 0 10px rgba(101, 202, 225, 0.15)",
                    }}
                />
            </motion.div>

            {/* Inner dot with momentum */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0"
                style={{
                    x: dotX,
                    y: dotY,
                    translateX: "-50%",
                    translateY: "-50%",
                    zIndex: 99999,
                }}
            >
                <motion.div
                    animate={{
                        scale: isHovered ? 1.5 : 1,
                        width: isHovered ? 12 : 8,
                        height: isHovered ? 12 : 8,
                    }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="rounded-full"
                    style={{
                        backgroundColor: "#65cae1",
                        boxShadow: isHovered
                            ? "0 0 20px rgba(101, 202, 225, 0.9), 0 0 40px rgba(101, 202, 225, 0.5)"
                            : "0 0 10px rgba(101, 202, 225, 0.7), 0 0 20px rgba(101, 202, 225, 0.4)",
                    }}
                />
            </motion.div>
        </>
    );
}
