import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSaveProfile,
  useUserProfile,
  useUserRole,
} from "../hooks/useQueries";

export default function Settings() {
  const { t, lang, setLang } = useLanguage();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: role } = useUserRole();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({ name });
      toast.success(t("profile_saved"));
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl" data-ocid="settings.page">
      <h1 className="text-2xl font-bold">{t("settings_title")}</h1>

      {/* Profile Card */}
      <Card className="border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">{t("profile_name")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileLoading ? (
            <Skeleton
              className="h-10 w-full"
              data-ocid="settings.profile.loading_state"
            />
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="s-name">{t("profile_name")}</Label>
                <Input
                  data-ocid="settings.profile.name.input"
                  id="s-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <Button
                data-ocid="settings.save_profile.button"
                onClick={handleSave}
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t("save_profile")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Language Card */}
      <Card className="border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">{t("language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              data-ocid="settings.language.en.toggle"
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => setLang("en")}
            >
              <Globe className="w-4 h-4 mr-2" /> English
            </Button>
            <Button
              data-ocid="settings.language.gr.toggle"
              variant={lang === "gr" ? "default" : "outline"}
              onClick={() => setLang("gr")}
            >
              <Globe className="w-4 h-4 mr-2" /> Ελληνικά
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Card */}
      <Card className="border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">{t("role")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant="outline"
            className="text-sm px-3 py-1"
            data-ocid="settings.role.card"
          >
            {role ?? "—"}
          </Badge>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center pt-4">
        © {new Date().getFullYear()} · Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
