import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { CustomClickEvent } from "@/components/analytics/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ThemeToggle from "../ui/theme-toggle";

function usePathname() {
  const [path, setPath] = useState<string>("");
  useEffect(() => {
    setPath(window.location.pathname);
  }, []);
  return path;
}

const HEADER_HEIGHT = 80; // h-20

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMenuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMenuOpen]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | "auto">(0);
  const [minOpenHeight, setMinOpenHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const remainder = Math.max(0, window.innerHeight - HEADER_HEIGHT);
    setMinOpenHeight(remainder);

    const onEnd = () => {
      if (isMenuOpen) setPanelHeight("auto");
      wrapper.removeEventListener("transitionend", onEnd);
    };

    if (isMenuOpen) {
      const target = Math.max(content.scrollHeight, remainder);
      setPanelHeight(target);
      wrapper.addEventListener("transitionend", onEnd);
    } else {
      const current = wrapper.getBoundingClientRect().height || 0;
      setPanelHeight(current);
      requestAnimationFrame(() => setPanelHeight(0));
    }
  }, [isMenuOpen, pathname]);

  useEffect(() => {
    const onResize = () => {
      if (!isMenuOpen || !contentRef.current) return;
      const remainder = Math.max(0, window.innerHeight - HEADER_HEIGHT);
      setMinOpenHeight(remainder);
      if (panelHeight !== "auto") {
        const target = Math.max(contentRef.current.scrollHeight, remainder);
        setPanelHeight(target);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMenuOpen, panelHeight]);

  const ITEMS = [];

  return (
    <header
      className="border-border border-b-[var(--scalify-green)]/50 relative z-50 h-20 border-b px-2.5 lg:px-0"
      style={{ backgroundColor: "var(--scalify-deep-blue)" }}
    >
      <div className="container flex h-20 items-center justify-between lg:grid lg:grid-cols-[auto_1fr_auto]">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/layout/logo-scalify.svg" alt="Scalify" width={129} height={32} className="" />
        </a>

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {ITEMS?.map((link) => (
            <CustomClickEvent key={link.label} eventName="nav_click" location="navbar" linkText={link.label} linkUrl={link.href}>
              <a
                href={link.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors",
                  pathname === link.href && "text-foreground",
                )}
              >
                {link.label}
              </a>
            </CustomClickEvent>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {/* <a href="/login" className={cn("hidden sm:block lg:block")}>
            <Button size="sm" variant="outline">
              Login
            </Button>
          </a> */}
          <CustomClickEvent eventName="cta_click" location="navbar" ctaText="Agendar Reunión" ctaType="primary">
            <a href="mailto:consultas@scalifyagencia.online" className={cn("hidden sm:block lg:block")}>
              <Button
                size="sm"
                variant="default"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                href="mailto:consultas@scalifyagencia.online"
                target="_blank"
                rel="noopener noreferrer"
              >
                Agendar Reunión
              </Button>
            </a>
          </CustomClickEvent>

          <div className="lg:block">
            <ThemeToggle />
          </div>

          <button
            className="text-muted-foreground relative flex size-8 lg:hidden"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle main menu"
          >
            <span className="sr-only">Toggle main menu</span>
            <div className="absolute left-1/2 top-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out",
                  isMenuOpen ? "rotate-45" : "-translate-y-1.5",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out",
                  isMenuOpen ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out",
                  isMenuOpen ? "-rotate-45" : "translate-y-1.5",
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Full-bleed, in-flow mobile menu below the bar */}
      <div className="lg:hidden">
        <div
          ref={wrapperRef}
          style={{
            height: panelHeight === "auto" ? "auto" : panelHeight,
            minHeight: isMenuOpen ? `${minOpenHeight}px` : undefined,
            transition: "height 320ms cubic-bezier(.22,.61,.36,1)",
          }}
          className={cn("border-border bg-background overflow-hidden border-t", "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen")}
          aria-hidden={!isMenuOpen}
        >
          <div ref={contentRef} className="max-h-[calc(100vh-80px)] overflow-auto">
            <div className="container px-2.5">
              <div className="px-5">
                <nav
                  className={cn(
                    "mt-6 flex flex-col",
                    "transition-[transform,opacity] duration-300",
                    isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                  )}
                >
                  <div className="flex flex-col gap-6">
                    {ITEMS.map((link) => (
                      <CustomClickEvent key={link.label} eventName="nav_click" location="mobile_menu" linkText={link.label} linkUrl={link.href}>
                        <a
                          href={link.href}
                          className={cn("text-lg tracking-[-0.36px]", pathname === link.href ? "text-foreground" : "text-muted-foreground")}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </a>
                      </CustomClickEvent>
                    ))}
                  </div>

                  <div className="mb-6 mt-4 flex flex-col gap-3">
                    <CustomClickEvent eventName="cta_click" location="mobile_menu" ctaText="Login" ctaType="secondary">
                      <a href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full" size="sm" variant="outline">
                          Login
                        </Button>
                      </a>
                    </CustomClickEvent>

                    <CustomClickEvent eventName="cta_click" location="mobile_menu" ctaText="Get Started" ctaType="primary">
                      <a href="/pricing" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full" size="sm" variant="default">
                          Get Started
                        </Button>
                      </a>
                    </CustomClickEvent>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
