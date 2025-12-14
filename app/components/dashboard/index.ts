// Exportamos todos los componentes desde un solo punto
// ConvenioItem and ConvenioTypeCard moved to features/agreements - re-exported for compat
export { ConvenioItem } from '@/features/agreements/components/cards/ConvenioItem';
export { ConvenioTypeCard } from '@/features/agreements/components/cards/ConvenioTypeCard';
export { ActivityItem } from './ActivityItem';
export { DashboardHeader } from './DashboardHeader';
export { SectionContainer } from './SectionContainer';
export { BackgroundPattern } from './BackgroundPattern';

// También exportamos los tipos
export type { ConvenioStatus, ConvenioItemProps } from '@/features/agreements/components/cards/ConvenioItem';
export type { ConvenioColor, ConvenioTypeCardProps } from '@/features/agreements/components/cards/ConvenioTypeCard';
export type { ActivityType, ActivityItemProps } from './ActivityItem';
export type { DashboardHeaderProps } from './DashboardHeader';
export type { SectionContainerProps } from './SectionContainer';

// Exportar utilidades
export { formatTimeAgo, getIconForType, getColorForType } from '../../lib/dashboard/utils'; 
