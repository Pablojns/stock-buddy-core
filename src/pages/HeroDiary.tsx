import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroHeader } from '@/components/hero/HeroHeader';
import { LevelUpModal } from '@/components/hero/LevelUpModal';
import { QuestsTab } from '@/components/hero/QuestsTab';
import { HabitsTab } from '@/components/hero/HabitsTab';
import { ScrollsTab } from '@/components/hero/ScrollsTab';
import { RewardsTab } from '@/components/hero/RewardsTab';
import { AttributesTab } from '@/components/hero/AttributesTab';
import { useHeroState } from '@/hooks/useHeroState';

const TABS = [
  { value: 'missoes', label: 'Missões' },
  { value: 'habitos', label: 'Hábitos' },
  { value: 'pergaminhos', label: 'Pergaminhos' },
  { value: 'recompensas', label: 'Recompensas' },
  { value: 'atributos', label: 'Atributos' },
];

export default function HeroDiary() {
  const store = useHeroState();

  return (
    <div className="min-h-screen">
      <HeroHeader xp={store.state.xp} level={store.level} rank={store.rank} balance={store.balance} />

      <main className="mx-auto max-w-5xl px-4 py-5">
        <Tabs defaultValue="missoes">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-transparent p-0 sm:grid-cols-5">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-sm border border-border bg-secondary/50 py-1.5 font-display text-[11px] data-[state=active]:border-primary/60 data-[state=active]:bg-primary/15 data-[state=active]:text-primary sm:text-xs"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-5">
            <TabsContent value="missoes"><QuestsTab store={store} /></TabsContent>
            <TabsContent value="habitos"><HabitsTab store={store} /></TabsContent>
            <TabsContent value="pergaminhos"><ScrollsTab store={store} /></TabsContent>
            <TabsContent value="recompensas"><RewardsTab store={store} /></TabsContent>
            <TabsContent value="atributos"><AttributesTab store={store} /></TabsContent>
          </div>
        </Tabs>
      </main>

      <LevelUpModal level={store.levelUp} rank={store.rank} onClose={store.dismissLevelUp} />
    </div>
  );
}
