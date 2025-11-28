import { useEffect, useState } from "react";

export const useIsMobile = (breakpoint: number = 992) => {
    // 992px = tablet trở xuống theo Ant Design (lg)
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isMobile;
};
