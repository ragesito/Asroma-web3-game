"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ArrowDown, ChevronDown  } from "lucide-react";
import { useHydrated } from "@/app/hooks/useHydrated";
interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
}

export default function Select({ value, onChange, options, label }: Props) {
  const selected = options.find((o) => o.value === value);
    const hydrated = useHydrated();
    if (!hydrated) return null;
  return (
    <div className="w-42 z-1">
      

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className="
              relative w-full md:w-32 cursor-pointer rounded-lg bg-black/40 
              border border-white/20 py-2 pl-4 pr-10 text-left 
              text-white shadow-md hover:bg-black/60 transition
            "
          >
            <span className="block truncate">{selected?.label}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown  />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="transition duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Listbox.Options
  className="
    absolute top-full left-0 max-h-60 w-full  overflow-auto rounded-lg 
    bg-black/90 backdrop-blur-xl shadow-lg border border-white/10 
    py-2 z-[9999]
  "
>


              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active }) =>
                    `
                      cursor-pointer select-none px-4 py-2 text-sm 
                      ${
                        active
                          ? "bg-purple-600/30 text-white"
                          : "text-gray-300"
                      }
                    `
                  }
                >
                  {opt.label}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
