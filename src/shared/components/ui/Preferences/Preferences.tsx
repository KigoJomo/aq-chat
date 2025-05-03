'use client';

import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { SettingsIcon, SlidersHorizontal } from 'lucide-react';
import { FC, useState } from 'react';
import { Palette, Shield, HelpCircle } from 'lucide-react';
import GeneralContent from './GeneralContent';
import AppearanceContent from './AppearanceContent';
import PrivacyContent from './PrivacyContent';
import SupportContent from './SupportContent';

interface PreferencesProps {
  panelOpen: boolean;
}

const Preferences: FC<PreferencesProps> = ({ panelOpen }) => {
  const tabs = [
    {
      name: 'General',
      icon: SlidersHorizontal,
    },
    {
      name: 'Appearance',
      icon: Palette,
    },
    {
      name: 'Privacy',
      icon: Shield,
    },
    {
      name: 'Support',
      icon: HelpCircle,
    },
  ] as const;

  const { isSignedIn } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].name);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      {isSignedIn && (
        <div className="w-full mt-auto pt-2 border-t border-foreground-light/30">
          <button
            onClick={toggleModal}
            className={cn(
              'shrink-0',
              'flex items-center py-2',
              panelOpen ? 'gap-2 px-4 hover:bg-background' : 'gap-0 px-0.5',
              'bg-transparent rounded-xl',
              'transition-all duration-100'
            )}
            style={{ width: 'inherit' }}>
            <SettingsIcon size={16} className="shrink-0" />

            {panelOpen && (
              <span className="text-xs text-foreground-light">Preferences</span>
            )}
          </button>
        </div>
      )}

      <div
        className={cn(
          'fixed top-0 left-0 inset-0 z-[60]',
          modalOpen ? 'flex' : 'hidden',
          'flex-col items-center justify-center'
        )}>
        <div
          onClick={toggleModal}
          className={cn('absolute inset-0 z-[55]', 'bg-background/60')}
        />

        <div
          className={cn(
            'preferences w-full md:w-2xl aspect-[4/2.5] rounded-3xl',
            'bg-background-light z-[60]',
            'border border-foreground-light/30',
            'flex'
          )}>
          <div
            className={cn(
              'tabs h-full w-48 p-4 shrink-0',
              'border-r border-foreground-light/30',
              'flex flex-col gap-2'
            )}>
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(tab.name)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2',
                  'rounded-lg transition-colors',
                  activeTab === tab.name
                    ? 'bg-background/60 text-foreground'
                    : 'bg-transparent text-foreground-light',
                  'hover:bg-background/60',
                  'text-sm text-foreground-light'
                )}>
                <tab.icon size={16} className="shrink-0" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="tab-content h-full w-full p-4">
            {activeTab === 'General' && <GeneralContent />}
            {activeTab === 'Appearance' && <AppearanceContent />}
            {activeTab === 'Privacy' && <PrivacyContent />}
            {activeTab === 'Support' && <SupportContent />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Preferences;
