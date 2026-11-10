import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialModal({ isOpen, onClose }: TrialModalProps) {
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate('/register');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-premium-gray border border-white/10 p-8 rounded-2xl w-full max-w-md relative shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-serif font-bold text-gold mb-4">Teste Gratuito de 30 Dias</h2>
            <div className="text-white/80 mb-8 leading-relaxed space-y-3 text-sm">
              <p>
                🚀 <strong>Plano Maior Liberado:</strong> Durante os primeiros 30 dias, você tem acesso total a todos os recursos premium do sistema sem custo.
              </p>
              <p>
                ✓ <strong>Sem bloqueio surpresa:</strong> Quando o teste de 30 dias terminar, sua conta retorna automaticamente ao <span className="text-emerald-400 font-bold">Plano Gratuito</span> (com funções essenciais) e o aplicativo <strong>continua funcionando</strong>!
              </p>
              <p className="text-xs text-gold/80">
                ⭐ Promoção especial: se desejar manter todos os recursos avançados, você tem 70% de desconto garantido por 2 anos!
              </p>
            </div>

            <button 
              onClick={handleContinue}
              className="w-full gold-gradient text-premium-black font-bold py-4 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              CONTINUAR
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
