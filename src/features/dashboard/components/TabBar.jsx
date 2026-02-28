import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function TabBar({ tabs, activeTab, onChange }) {
  return (
    <Tabs value={activeTab} onValueChange={onChange}>
      <TabsList className="dashboard-tabbar" aria-label="Dashboard sections">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="dashboard-tabbar__button"
            disabled={!tab.enabled}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
