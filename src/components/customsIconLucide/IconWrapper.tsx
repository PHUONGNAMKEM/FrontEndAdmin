import { LucideIcon } from 'lucide-react';

interface IconWrapperProps {
    Icon: LucideIcon;
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export const IconWrapper = ({
    Icon,
    size = 20,
    color = 'var(--icon-color)',
    strokeWidth = 1.75,
}: IconWrapperProps) => (
    <Icon className='m-1.5' size={size} color={color} strokeWidth={strokeWidth} />
);
