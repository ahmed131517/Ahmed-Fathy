import React from 'react';
import { Pill, FlaskConical, Syringe, Wind, Sparkles, Droplets, Package, ShieldAlert, FileText } from 'lucide-react';

export type DosageFormCategory =
  | 'tablet'
  | 'syrup'
  | 'injection'
  | 'inhaler'
  | 'topical'
  | 'drops'
  | 'sachet'
  | 'suppository'
  | 'other';

export interface DosageFormDetails {
  category: DosageFormCategory;
  label: string;
  symbol: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconColor: string;
  safetyNote?: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export function getDosageFormDetails(formInput?: string | null): DosageFormDetails {
  const str = (formInput || '').toLowerCase().trim();

  if (
    str.includes('inj') ||
    str.includes('vial') ||
    str.includes('amp') ||
    str.includes('infusion') ||
    str.includes('iv') ||
    str.includes('im') ||
    str.includes('subcutaneous') ||
    str.includes('parenteral')
  ) {
    return {
      category: 'injection',
      label: 'Injection / Parenteral',
      symbol: '💉',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      iconColor: 'text-rose-600',
      safetyNote: '⚠️ PARENTERAL: Verify IV/IM/SC route & dilution rate',
      Icon: Syringe,
    };
  }

  if (
    str.includes('syrup') ||
    str.includes('suspension') ||
    str.includes('liquid') ||
    str.includes('solution') ||
    str.includes('elixir') ||
    str.includes('mixture') ||
    str.includes('susp') ||
    str.includes('oral drops')
  ) {
    return {
      category: 'syrup',
      label: 'Oral Liquid / Syrup',
      symbol: '🧪',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      iconColor: 'text-amber-600',
      safetyNote: '🧪 ORAL LIQUID: Shake well if suspension & measure with syringe/cup',
      Icon: FlaskConical,
    };
  }

  if (
    str.includes('inhal') ||
    str.includes('aerosol') ||
    str.includes('puff') ||
    str.includes('neb') ||
    str.includes('respule') ||
    str.includes('spray') ||
    str.includes('rotacap') ||
    str.includes('turbuhaler')
  ) {
    return {
      category: 'inhaler',
      label: 'Inhaler / Respiratory',
      symbol: '🌬️',
      badgeBg: 'bg-cyan-50',
      badgeText: 'text-cyan-800',
      badgeBorder: 'border-cyan-200',
      iconColor: 'text-cyan-600',
      safetyNote: '🌬️ INHALATION: Rinse mouth after corticosteroid inhaler use',
      Icon: Wind,
    };
  }

  if (
    str.includes('cream') ||
    str.includes('ointment') ||
    str.includes('gel') ||
    str.includes('lotion') ||
    str.includes('topical') ||
    str.includes('paste') ||
    str.includes('patch') ||
    str.includes('derm')
  ) {
    return {
      category: 'topical',
      label: 'Topical / External',
      symbol: '🧴',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      safetyNote: '🧴 EXTERNAL USE ONLY: Do not ingest or contact open wounds',
      Icon: Sparkles,
    };
  }

  if (
    str.includes('drop') ||
    str.includes('ophthalmic') ||
    str.includes('eye') ||
    str.includes('otic') ||
    str.includes('ear') ||
    str.includes('collyrium')
  ) {
    return {
      category: 'drops',
      label: 'Drops (Eye/Ear/Nasal)',
      symbol: '💧',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-800',
      badgeBorder: 'border-purple-200',
      iconColor: 'text-purple-600',
      safetyNote: '💧 DROPS: Verify Eye vs Ear route and keep applicator tip sterile',
      Icon: Droplets,
    };
  }

  if (
    str.includes('sachet') ||
    str.includes('powder') ||
    str.includes('granule') ||
    str.includes('packet')
  ) {
    return {
      category: 'sachet',
      label: 'Sachet / Powder',
      symbol: '📦',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-800',
      badgeBorder: 'border-orange-200',
      iconColor: 'text-orange-600',
      safetyNote: '📦 ORAL POWDER: Dissolve or mix thoroughly in specified fluid volume',
      Icon: Package,
    };
  }

  if (
    str.includes('suppos') ||
    str.includes('pessary') ||
    str.includes('vaginal') ||
    str.includes('rectal') ||
    str.includes('enema')
  ) {
    return {
      category: 'suppository',
      label: 'Suppository / Local',
      symbol: '🛡️',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-800',
      badgeBorder: 'border-indigo-200',
      iconColor: 'text-indigo-600',
      safetyNote: '🛡️ LOCAL ROUTE: For rectal or vaginal administration as instructed',
      Icon: ShieldAlert,
    };
  }

  if (
    str.includes('tab') ||
    str.includes('cap') ||
    str.includes('softgel') ||
    str.includes('pill') ||
    str.includes('orodispersible') ||
    str.includes('effervescent') ||
    str.includes('chewable')
  ) {
    return {
      category: 'tablet',
      label: 'Oral Solid (Tab/Cap)',
      symbol: '💊',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-800',
      badgeBorder: 'border-sky-200',
      iconColor: 'text-sky-600',
      safetyNote: '💊 ORAL SOLID: Swallowed whole unless specified as chewable or dispersible',
      Icon: Pill,
    };
  }

  return {
    category: 'other',
    label: formInput || 'Formulation',
    symbol: '💊',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    iconColor: 'text-slate-500',
    Icon: FileText,
  };
}

interface DosageFormBadgeProps {
  form: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showSafetyNote?: boolean;
  showSymbol?: boolean;
  className?: string;
}

export function DosageFormBadge({
  form,
  size = 'sm',
  showSymbol = true,
  className = '',
}: DosageFormBadgeProps) {
  const details = getDosageFormDetails(form);
  const { Icon } = details;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-[11px] gap-1.5 font-semibold',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-bold',
    lg: 'px-3 py-1.5 text-sm gap-2 font-bold',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  }[size];

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span
        className={`inline-flex items-center rounded-md border shadow-2xs transition-all ${details.badgeBg} ${details.badgeText} ${details.badgeBorder} ${sizeClasses}`}
        title={`${details.label} - ${form}`}
      >
        {showSymbol && <span className="select-none leading-none">{details.symbol}</span>}
        <Icon className={`${iconSizes} ${details.iconColor} shrink-0`} />
        <span className="truncate">{form || details.label}</span>
      </span>
    </div>
  );
}
