import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Download, Share, PlusSquare, X, QrCode, CheckCircle2, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import logoImg from '../assets/images/dgrau_logo_1785466160845.jpg';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPwa,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'qrcode'>('android');
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const ios = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      const android = /android/i.test(userAgent);
      setIsIOS(ios);
      setIsAndroid(android);
      if (ios) {
        setActiveTab('ios');
      } else if (android) {
        setActiveTab('android');
      }
    }
  }, []);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-neutral-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden glow-green-lg my-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-5 sm:p-6 text-center border-b border-emerald-500/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative inline-block mb-3 group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-70 blur-md group-hover:opacity-100 transition duration-500"></div>
              <img
                src={logoImg}
                alt="Logo Rodada D'Grau"
                className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl border-2 border-emerald-500/60 shadow-xl bg-black mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
              BAIXAR APP D'GRAU
            </h3>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wider uppercase mt-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> APLICATIVO OFICIAL PARA CELULAR <Sparkles className="w-3.5 h-3.5" />
            </p>
          </div>

          {/* OS Selector Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/80 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'android'
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Android
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'ios'
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              iPhone / iOS
            </button>

            <button
              onClick={() => setActiveTab('qrcode')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'qrcode'
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* ANDROID TAB */}
            {activeTab === 'android' && (
              <div className="space-y-4">
                <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <p className="text-xs sm:text-sm text-neutral-300 mb-3">
                    Instale o app diretamente no seu Android para jogar com acesso rápido e notificações ativas.
                  </p>

                  <button
                    onClick={onInstallPwa}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display font-extrabold text-lg uppercase tracking-wider rounded-xl shadow-lg glow-green flex items-center justify-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    {deferredPrompt ? 'Instalar App Rodada D\'Grau' : 'Baixar App D\'Grau (Android)'}
                  </button>

                  <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    App Seguro e Verificado • Logomarca Oficial D'Grau
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-neutral-950/60 rounded-2xl p-4 border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Passo a passo no Android:
                  </h4>
                  <ol className="text-xs text-neutral-300 space-y-2.5 list-decimal pl-4">
                    <li>
                      Clique no botão <strong className="text-emerald-300">"Instalar App"</strong> acima ou abra os 3 pontinhos do Chrome/Navegador.
                    </li>
                    <li>
                      Selecione a opção <strong className="text-emerald-300">"Instalar aplicativo"</strong> ou <strong className="text-emerald-300">"Adicionar à Tela Inicial"</strong>.
                    </li>
                    <li>
                      Confirme a instalação. O ícone oficial com a logo <strong className="text-emerald-300">D'Grau</strong> aparecerá junto com os seus outros apps!
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* IOS TAB */}
            {activeTab === 'ios' && (
              <div className="space-y-4">
                <div className="bg-neutral-950/80 border border-emerald-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-neutral-900 border border-emerald-500/40 rounded-xl text-emerald-400">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Instalar no iPhone (Safari / iOS)
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Adicione o app D'Grau à sua tela de início em 3 cliques rápidos.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-neutral-900/90 rounded-xl p-3.5 border border-neutral-800 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40">
                        1
                      </div>
                      <p className="text-neutral-200">
                        Abra este site usando o navegador <strong className="text-white">Safari</strong> no seu iPhone.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40">
                        2
                      </div>
                      <p className="text-neutral-200 flex items-center gap-1.5 flex-wrap">
                        Toque no botão de <strong className="text-emerald-400 flex items-center gap-1 border border-emerald-500/30 px-1.5 py-0.5 rounded bg-neutral-800"><Share className="w-3.5 h-3.5" /> Compartilhar</strong> na barra inferior do Safari.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40">
                        3
                      </div>
                      <p className="text-neutral-200 flex items-center gap-1.5 flex-wrap">
                        Role para baixo e selecione <strong className="text-emerald-400 flex items-center gap-1 border border-emerald-500/30 px-1.5 py-0.5 rounded bg-neutral-800"><PlusSquare className="w-3.5 h-3.5" /> Adicionar à Tela de Início</strong>.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40">
                        4
                      </div>
                      <p className="text-neutral-200">
                        Confirme no canto superior em <strong className="text-emerald-300">"Adicionar"</strong>. O App D'Grau com a logomarca oficial surgirá na sua tela principal.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Link Copiado com Sucesso!
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Copiar Link para Abrir no Safari
                    </>
                  )}
                </button>
              </div>
            )}

            {/* QR CODE TAB */}
            {activeTab === 'qrcode' && (
              <div className="text-center space-y-4">
                <p className="text-xs text-neutral-300">
                  Escaneie o QR Code abaixo com a câmera do seu celular para abrir o site e instalar o App D'Grau no Android ou iOS:
                </p>

                <div className="bg-white p-4 rounded-2xl inline-block shadow-xl border-4 border-emerald-500/50">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`}
                    alt="QR Code D'Grau App"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Compatível com Android e iPhone (iOS)</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-neutral-950 p-4 border-t border-neutral-800 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
