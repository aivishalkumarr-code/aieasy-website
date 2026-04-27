"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { updateSEOSetting } from "@/app/dashboard/actions/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SEOSetting } from "@/types";

interface SEOEditorProps {
  initialSettings: SEOSetting[];
}

export function SEOEditor({ initialSettings }: SEOEditorProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const updateField = (pagePath: string, field: keyof SEOSetting, value: string) => {
    setSettings((current) =>
      current.map((setting) =>
        setting.page_path === pagePath ? { ...setting, [field]: value } : setting,
      ),
    );
  };

  const handleSave = (setting: SEOSetting) => {
    startTransition(async () => {
      const result = await updateSEOSetting(setting);

      if (!result.success || !result.data) {
        setFeedback((current) => ({
          ...current,
          [setting.page_path]: result.message ?? "Unable to save metadata.",
        }));
        return;
      }

      setSettings((current) =>
        current.map((entry) =>
          entry.page_path === setting.page_path ? result.data! : entry,
        ),
      );
      setFeedback((current) => ({
        ...current,
        [setting.page_path]: result.message ?? "Metadata saved.",
      }));
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Site metadata controls</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6B7280]">
          Edit page titles, descriptions, keywords, and Open Graph image paths for every key
          public and dashboard route.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {settings.map((setting) => (
          <article
            key={setting.page_path}
            className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#2563EB]">
                  Page path
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#1A1A1A]">{setting.page_path}</h3>
              </div>
              <Button
                type="button"
                onClick={() => handleSave(setting)}
                disabled={isPending}
                className="h-10 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              <Input
                value={setting.title}
                onChange={(event) => updateField(setting.page_path, "title", event.target.value)}
                placeholder="Meta title"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
              <Textarea
                value={setting.description}
                onChange={(event) =>
                  updateField(setting.page_path, "description", event.target.value)
                }
                placeholder="Meta description"
                className="min-h-[120px] rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
              <Input
                value={setting.keywords}
                onChange={(event) => updateField(setting.page_path, "keywords", event.target.value)}
                placeholder="Comma-separated keywords"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
              <Input
                value={setting.og_image ?? ""}
                onChange={(event) => updateField(setting.page_path, "og_image", event.target.value)}
                placeholder="OG image URL or path"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
            </div>

            {feedback[setting.page_path] ? (
              <p className="mt-4 text-sm text-[#1D4ED8]">{feedback[setting.page_path]}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
