import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { getProducts } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Download, FileText, FolderDown } from "lucide-react";

export default async function LibraryPage() {
  const products = await getProducts({ limit: 4 });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            My Digital Library
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Download your purchased boilerplates, templates, presets, and guides anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="p-6 rounded-3xl bg-surface-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface-2">
                  <Image
                    src={p.cover_url}
                    alt={p.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {p.type} &bull; {p.version || "v1.0"}
                  </span>
                  <h3 className="text-base font-bold text-ink line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-ink-muted line-clamp-2 mt-1">{p.subtitle}</p>
                </div>
              </div>

              <div>
                <Button variant="secondary" size="md" className="w-full font-bold">
                  <Download className="h-4 w-4 mr-2" />
                  Download Assets ({p.file_count} files)
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
