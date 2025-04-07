'use client';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState, ReactNode, useRef, useEffect } from 'react';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  content: string | ReactNode;
  position?: TooltipPosition;
  delay?: number;
  children: ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 300,
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  let timeout: NodeJS.Timeout;

  const positionMap = {
    top: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
    right: { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 } },
    bottom: { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 } },
  };

  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const handleMouseEnter = () => {
    timeout = setTimeout(() => {
      if (targetRef.current) {
        setIsVisible(true);
      }
    }, delay);
  };
  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <div
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`absolute z-50 ${positionClass[position]} max-w-64
              text-nowrap rounded-md bg-background-light backdrop-blur-3xl text-foreground border border-foreground-light px-3 py-1.5 text-sm shadow-md ${className}`}
            initial={positionMap[position].initial}
            animate={positionMap[position].animate}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;