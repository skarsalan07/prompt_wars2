"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("jee-precision@demo.local");
  const [password, setPassword] = useState("demo1234");
  const [status, setStatus] = useState("");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="space-y-6">
        <SectionHeading
          description="Use a demo persona or admin credentials to test authenticated merge flows and Mongo-backed persistence."
          eyebrow="Sign In"
          title="NextAuth credentials flow"
        />
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await signIn("credentials", {
              email,
              password,
              redirect: false,
            });
            setStatus(result?.ok ? "Signed in. Refresh or navigate to keep working." : "Sign-in failed.");
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Email</span>
            <input
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Password</span>
            <input
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <Button type="submit">Sign in</Button>
        </form>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Demo credentials default to <code>demo1234</code> and can be changed with the <code>DEMO_PASSWORD</code> environment variable. {status}
        </p>
      </Card>
    </div>
  );
}
