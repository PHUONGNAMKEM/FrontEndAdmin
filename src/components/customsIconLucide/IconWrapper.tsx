import { LucideIcon } from 'lucide-react';

interface IconWrapperProps {
    Icon: LucideIcon;
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
}

export const IconWrapper = ({
    Icon,
    size = 20,
    color = 'var(--icon-color)',
    strokeWidth = 1.75,
    className = ""
}: IconWrapperProps) => (
    <Icon className={`m-1.5 ${className}`} size={size} color={color} strokeWidth={strokeWidth} />
);
