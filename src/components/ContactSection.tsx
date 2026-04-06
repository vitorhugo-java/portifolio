import { Mail, Linkedin, Github } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Github, href: "https://github.com/vitorhugo-java", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/hugo-java", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hugoalves.java@gmail.com", label: "Email" },
];

const ContactSection = () => {
  return (
    <>
      {/* Desktop: fixed floating icons on the right */}
      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="w-11 h-11 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground transition-all hover:text-primary hover:border-primary/50 hover:shadow-[var(--glow-primary)]"
          >
            <link.icon className="w-5 h-5" />
          </a>
        ))}
      </div>

      {/* Mobile: full section */}
      <section className="py-16 px-6 md:hidden">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <span className="font-mono text-primary text-sm">{">"}</span>
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Get In Touch
            </h2>
            <div className="flex-1 h-px bg-border ml-4" />
          </div>

          <div className="space-y-6">
            <p className="text-secondary-foreground leading-relaxed max-w-lg">
              Interested in working together or just want to say hi? Feel free to
              connect with me on social media.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-11 h-11 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground transition-all hover:text-primary hover:border-primary/50 hover:shadow-[var(--glow-primary)]"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;
