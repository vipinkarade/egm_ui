import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Bolt, Download, RefreshCcw, TerminalSquare } from 'lucide-react'

export function CommandPrompt({ open, onOpenChange }) {
  const closePrompt = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="command-prompt border-0 p-0 [&>button]:hidden">
        <header className="command-prompt__header">
          <div>
            <p className="command-prompt__title">Command Prompt</p>
            <p className="command-prompt__subtitle">Run quick actions (dummy)</p>
          </div>
          <kbd className="command-prompt__kbd">⌥ P</kbd>
        </header>

        <Command className="command-prompt__body">
          <CommandInput
            className="command-prompt__input"
            placeholder="Type a command or search..."
          />
          <CommandList className="command-prompt__list">
            <CommandEmpty className="command-prompt__empty">No matching command.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              <CommandItem className="command-prompt__item" onSelect={closePrompt}>
                <Bolt size={15} aria-hidden="true" />
                Start Application
                <CommandShortcut>Dummy</CommandShortcut>
              </CommandItem>
              <CommandItem className="command-prompt__item" onSelect={closePrompt}>
                <RefreshCcw size={15} aria-hidden="true" />
                Restart Application
                <CommandShortcut>Dummy</CommandShortcut>
              </CommandItem>
              <CommandItem className="command-prompt__item" onSelect={closePrompt}>
                <Download size={15} aria-hidden="true" />
                Download Logs
                <CommandShortcut>Dummy</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="System">
              <CommandItem className="command-prompt__item" onSelect={closePrompt}>
                <TerminalSquare size={15} aria-hidden="true" />
                Open Remote Shell
                <CommandShortcut>Dummy</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
