import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink, Download, ShieldCheck } from "lucide-react";

export default function CertificatesPage() {
  const certificates = [
    {
      id: "cert-1",
      serial: "BBD-2025-84920",
      title: "Production Next.js 15 & Full-Stack Architecture",
      instructor: "Tanvir Hossain",
      issuedAt: "February 15, 2025",
      skills: ["Next.js 15", "Supabase", "TypeScript", "Tailwind CSS"],
    },
    {
      id: "cert-2",
      serial: "BBD-2025-72014",
      title: "Modern Figma Design Systems & Token Architecture",
      instructor: "Samira Khan",
      issuedAt: "January 28, 2025",
      skills: ["Figma Variables", "Design Tokens", "Auto Layout 5.0", "WCAG AAA"],
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-accent" />
            <span>My Verified Certificates ({certificates.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Official cryptographically verifiable certificates earned upon 100% course completion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="p-8 rounded-3xl bg-surface-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold font-mono">
                    {cert.serial}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-ink">{cert.title}</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Instructed by {cert.instructor} &bull; Issued on {cert.issuedAt}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cert.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-surface-2 text-[11px] font-semibold text-ink">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" size="sm" className="flex-1 font-bold">
                  <Download className="h-4 w-4 mr-1.5" />
                  PDF Download
                </Button>
                <Button variant="primary" size="sm" className="flex-1 font-bold">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Public Verification Link
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
