import * as Tabs from '@radix-ui/react-tabs'

export function TabBar({ tabs, activeTab, onChange }) {
  return (
    <Tabs.Root value={activeTab} onValueChange={onChange}>
      <Tabs.List className="dashboard-tabbar" aria-label="Dashboard sections">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="dashboard-tabbar__button"
            disabled={!tab.enabled}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
