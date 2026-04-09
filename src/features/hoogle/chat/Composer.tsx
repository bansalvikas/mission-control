import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

interface Props {
  onSend: (text: string) => Promise<void> | void
  disabled: boolean
}

export function Composer({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autosize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  async function submit() {
    const text = value.trim()
    if (!text || disabled) return
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await onSend(text)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void submit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 border-t border-slate-900 bg-[#0a0a0f]/95 backdrop-blur px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-start gap-2 font-mono">
        <span className="text-[#00ff88] pt-2 select-none">&gt;</span>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autosize()
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="tell hoogle where you put something, or ask where it is..."
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none pt-1.5 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="text-[11px] tracking-widest uppercase text-slate-500 hover:text-[#00ff88] disabled:text-slate-800 disabled:cursor-not-allowed pt-2"
        >
          send
        </button>
      </div>
    </form>
  )
}
