import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { Input, Select, message } from 'antd';
import { useSendContactMutation } from '@/store/linktravelApi';
import { MapEmbed } from '@/components/MapEmbed';

const officeMapQuery = 'Link Travel, Rr. Ivo Lola Ribar 32, Gostivar, North Macedonia';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Na gjeni / Посетете не',
    details: ['Rr. Ivo Lola Ribar 32', 'Gostivar', 'North Macedonia'],
  },
  {
    icon: Phone,
    title: 'Telefon / WhatsApp / Viber',
    details: ['+389 71 726 726', '+389 70 816 209'],
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['linktravelnmk@gmail.com'],
  },
  {
    icon: Clock,
    title: 'Rezervime te shpejta',
    details: ['Na dergoni kerkesen tuaj', 'Do t’ju kontaktojme per konfirmim', 'Oferta aktuale sipas disponueshmerise'],
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sendContact, { isLoading: isSubmitting }] = useSendContactMutation();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendContact(formData).unwrap();
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      message.success('Your message has been sent successfully.');
    } catch {
      message.error('Failed to send your message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              Kontakto Link Travel
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Per Stamboll, Shqiperi, Tunizi dhe oferta te tjera sezonale, na shkruani direkt.
              Ekipi yne ju kthen pergjigje me cmim aktual dhe disponueshmeri.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info) => (
              <div key={info.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <info.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{info.title}</h3>
                <div className="mt-2 space-y-1">
                  {info.details.map((detail, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6">
                <MessageSquare className="h-5 w-5 text-primary" />
                Dergo kerkesen tende
              </h3>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Send className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Kerkesa u dergua!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Faleminderit. Link Travel do t&apos;ju kontaktoje me cmim aktual dhe hapat e ardhshem.
                  </p>
                  <button 
                    type="button"
                    className="mt-4 px-4 py-2 rounded-md border border-border text-sm font-medium bg-transparent hover:bg-muted transition-colors"
                    onClick={() => setSubmitted(false)}
                  >
                    Dergo nje tjeter kerkese
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">Emri dhe Mbiemri *</label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Emri juaj"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">Email *</label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-foreground">Telefon / WhatsApp</label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+389 71 726 726"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">Lloji i kerkeses *</label>
                      <Select
                        value={formData.subject || undefined}
                        onChange={(value) => handleChange('subject', value)}
                        placeholder="Zgjidhni nje subject"
                        className="w-full"
                        options={[
                          { value: 'booking', label: 'Rezervim hoteli' },
                          { value: 'package', label: 'Pakete udhetimi' },
                          { value: 'flight', label: 'Avio oferte' },
                          { value: 'summer', label: 'Pushime verore' },
                          { value: 'other', label: 'Tjeter' },
                        ]}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">Mesazhi *</label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Shkruani destinacionin, daten, numrin e personave dhe hotelin nese e keni zgjedhur..."
                      required
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Duke derguar...' : 'Dergo kerkesen'}
                    <Send className="ml-2 h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Map */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6">
                <MapPin className="h-5 w-5 text-primary" />
                Lokacioni yne
              </h3>
              <MapEmbed
                title="Link Travel Gostivar"
                subtitle="Rr. Ivo Lola Ribar 32, Gostivar"
                query={officeMapQuery}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-12 lg:py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold">Have More Questions?</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Na kontaktoni direkt per oferten me te fundit. Cmimet jane aktuale dhe mund te ndryshojne sipas dates dhe disponueshmerise.
          </p>
          <a
            href="mailto:linktravelnmk@gmail.com"
            className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Dergo email
          </a>
        </div>
      </section>
    </div>
  );
}
