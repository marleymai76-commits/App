export interface Blueprint {
  id: string;
  name: string;
  theme: 'dark' | 'light';
  primaryColor: string;
  pages: string[];
  components: {
    heroTitle: string;
    cta: string;
    features: string[];
  };
  defaultData: any;
}

export const BLUEPRINTS: Record<string, Blueprint> = {
  restaurant: {
    id: 'restaurant',
    name: 'Restaurante Premium',
    theme: 'dark',
    primaryColor: '#D4AF37',
    pages: ['home', 'menu', 'reservations', 'contact'],
    components: {
      heroTitle: 'Uma Experiência Gastronômica Única',
      cta: 'Reservar Mesa',
      features: ['Cardápio Digital', 'Reservas Online', 'Gestão de Mesas']
    },
    defaultData: {
      menu: [
        { name: 'Prato do Dia', price: 45.00, category: 'Principais' },
        { name: 'Vinho da Casa', price: 80.00, category: 'Bebidas' }
      ]
    }
  },
  beauty: {
    id: 'beauty',
    name: 'Salão & Estética',
    theme: 'light',
    primaryColor: '#FF69B4',
    pages: ['home', 'services', 'booking', 'gallery'],
    components: {
      heroTitle: 'Realce sua Beleza Natural',
      cta: 'Agendar Horário',
      features: ['Agendamento', 'Galeria de Fotos', 'Pacotes de Serviços']
    },
    defaultData: {
      services: [
        { name: 'Corte Feminino', price: 120.00, duration: '60 min' },
        { name: 'Manicure', price: 45.00, duration: '40 min' }
      ]
    }
  },
  tattoo: {
    id: 'tattoo',
    name: 'Studio de Tattoo',
    theme: 'dark',
    primaryColor: '#ff0000',
    pages: ['home', 'portfolio', 'budget', 'contact'],
    components: {
      heroTitle: 'Arte na Pele com Perfeição',
      cta: 'Pedir Orçamento',
      features: ['Portfólio', 'Calculadora de Preço', 'Cuidados Pós-Tattoo']
    },
    defaultData: {
      styles: ['Realismo', 'Old School', 'Fine Line']
    }
  }
};
