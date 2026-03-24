import { Mail, Linkedin, Github, Twitter } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Github, href: "https://github.com/vitorhugo-java", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/", label: "Twitter" },
  { icon: Mail, href: "mailto:contact@example.com", label: "Email" },
];

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSending(true);
    // Simulate send
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! I'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-primary text-sm">{">"}</span>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Get In Touch
          </h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Social Links */}
          <div className="space-y-6">
            <p className="text-secondary-foreground leading-relaxed">
              Interested in working together or just want to say hi? Feel free to reach out through the form or connect with me on social media.
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

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              {errors.name && <p className="text-destructive text-xs font-mono mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              {errors.email && <p className="text-destructive text-xs font-mono mt-1">{errors.email}</p>}
            </div>
            <div>
              <textarea
                placeholder="Your message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
              />
              {errors.message && <p className="text-destructive text-xs font-mono mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-semibold transition-all hover:shadow-[var(--glow-primary)] hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
