import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const colors = [
  { name: "Background", token: "bg-background", text: "text-foreground" },
  { name: "Card / Surface", token: "bg-card", text: "text-card-foreground" },
  { name: "Surface 2", token: "bg-surface-2", text: "text-foreground" },
  { name: "Primary / Copper", token: "bg-primary", text: "text-primary-foreground" },
  { name: "Accent / Gold", token: "bg-accent", text: "text-accent-foreground" },
  { name: "Muted", token: "bg-muted", text: "text-muted-foreground" },
  { name: "Destructive", token: "bg-destructive", text: "text-destructive-foreground" },
  { name: "Border", token: "bg-border", text: "text-foreground" },
  { name: "Success", token: "bg-success", text: "text-primary-foreground" },
];

const StyleGuide = () => (
  <PublicLayout>
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <h1 className="text-3xl text-silver">Style Guide</h1>

      {/* Colors */}
      <section>
        <h2 className="mb-4 text-xl text-silver">Colors</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {colors.map((c) => (
            <div key={c.name} className={`${c.token} ${c.text} rounded-xl border border-border p-4 text-sm font-medium`}>
              {c.name}
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="mb-4 text-xl text-silver">Typography</h2>
        <div className="space-y-2 rounded-xl border border-border bg-card p-6">
          <h1 className="text-3xl">Heading 1 — Silver</h1>
          <h2 className="text-2xl">Heading 2 — Silver</h2>
          <h3 className="text-xl">Heading 3 — Silver</h3>
          <p className="text-foreground">Body text — Foreground</p>
          <p className="text-muted-foreground">Muted text — Secondary</p>
          <a href="#" onClick={(e) => e.preventDefault()}>Link — Gold</a>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="mb-4 text-xl text-silver">Buttons</h2>
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-6">
          <Button variant="copper">Copper Primary</Button>
          <Button variant="copper-outline">Copper Outline</Button>
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="mb-4 text-xl text-silver">Badges</h2>
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-6">
          <span className="badge-copper">Copper Badge</span>
          <span className="badge-scheduled">Scheduled</span>
          <span className="badge-departed">Departed</span>
          <span className="badge-arrived">Arrived</span>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="mb-4 text-xl text-silver">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Standard Card</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Surface background with border styling.</p></CardContent>
          </Card>
          <div className="rounded-xl border-2 border-accent bg-card p-6">
            <h3 className="text-lg font-bold text-silver">Gold-bordered Card</h3>
            <p className="mt-2 text-sm text-muted-foreground">Used for disclaimers and highlights.</p>
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="mb-4 text-xl text-silver">Inputs</h2>
        <div className="max-w-md space-y-3 rounded-xl border border-border bg-card p-6">
          <Input placeholder="Default input" />
          <Input placeholder="Auth-styled input" className="auth-input" />
        </div>
      </section>
    </div>
  </PublicLayout>
);

export default StyleGuide;
