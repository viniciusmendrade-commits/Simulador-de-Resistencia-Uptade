import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { TeacherNpc } from './Npc';

interface TutorialStep {
    text: string;
    highlightId?: string;
}

const tutorialSteps: TutorialStep[] = [
    {
        text: "Olá! Sou a Engenheira Milena, e vou te guiar na construção do seu arranha-céu super-resistente. Meu objetivo é explicar como funciona o jogo. Preparado? Clique para continuar!",
    },
    {
        text: "Este é o seu canteiro de obras. Aqui você verá seu edifício tomar forma. Seu objetivo é construí-lo da forma mais robusta possível.",
        highlightId: 'tutorial-building-area',
    },
    {
        text: "Esta é a barra de 'Integridade Estrutural'. Após um desastre, ela mostrará a saúde geral do seu edifício. Tente mantê-la o mais verde possível!",
        highlightId: 'tutorial-health-bar',
    },
    {
        text: "O 'Bônus Estrutural' reduz o dano que seu prédio sofre. Ele aumenta quando você usa materiais mais fortes nos Pilares, Vigas e Pisos. É uma peça chave para a vitória!",
        highlightId: 'tutorial-structural-bonus',
    },
    {
        text: "Este é o 'Painel de Controle', seu centro de comando. Aqui você gerencia toda a construção e simulação.",
        highlightId: 'tutorial-control-panel',
    },
    {
        text: "Na aba 'Construção', você edifica sua torre, andar por andar. Selecione um andar e escolha os melhores materiais. Lembre-se, qualidade tem um custo!",
        highlightId: 'tutorial-tab-build',
    },
    {
        text: "A aba 'Defesas' oferece proteções únicas contra um tipo específico de desastre. Você só pode instalar um sistema de defesa, então escolha com sabedoria!",
        highlightId: 'tutorial-tab-defense',
    },
    {
        text: "Quando estiver orgulhoso da sua obra, venha para a aba 'Simulação' e libere a fúria da natureza! Veja se seu planejamento foi bem-sucedido.",
        highlightId: 'tutorial-tab-simulate',
    },
    {
        text: "Tudo pronto! Agora é com você. Mostre seu talento como engenheiro e construa a torre mais segura do mundo. Boa sorte!",
    }
];


interface TutorialProps {
    step: number;
    onNext: () => void;
    onSkip: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ step, onNext, onSkip }) => {
    const [rect, setRect] = useState<DOMRect | null>(null);
    
    const currentStep = tutorialSteps[step];
    if (!currentStep) return null;

    const updateRect = useCallback(() => {
        const elem = currentStep.highlightId ? document.getElementById(currentStep.highlightId) : null;
        
        if (elem) {
            setRect(elem.getBoundingClientRect());
        } else {
            setRect(null);
        }
    }, [currentStep.highlightId]);

    useLayoutEffect(() => {
        updateRect();
    }, [updateRect]);

    useEffect(() => {
        if (!currentStep.highlightId) return;

        window.addEventListener('scroll', updateRect, true);
        window.addEventListener('resize', updateRect, true);

        return () => {
            window.removeEventListener('scroll', updateRect, true);
            window.removeEventListener('resize', updateRect, true);
        };
    }, [updateRect, currentStep.highlightId]);


    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        onNext();
    }

    const handleSkip = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSkip();
    }

    return (
        <div className="fixed inset-0 z-50 animate-[fade-in_0.5s_ease-in-out]" onClick={handleNext}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <mask id="tutorial-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {rect && (
                            <rect 
                                x={rect.left - 10} 
                                y={rect.top - 10} 
                                width={rect.width + 20} 
                                height={rect.height + 20} 
                                rx="8"
                                fill="black" 
                                className="transition-all duration-500 ease-in-out"
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(2, 6, 23, 0.8)" mask="url(#tutorial-mask)" />
            </svg>

            {rect && (
                <div 
                    className="absolute rounded-lg border-4 border-amber-400 border-dashed pointer-events-none transition-all duration-500 ease-in-out"
                    style={{
                        top: rect.top - 10,
                        left: rect.left - 10,
                        width: rect.width + 20,
                        height: rect.height + 20,
                    }}
                />
            )}
            
            <div className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 flex items-end gap-4 max-w-lg w-[calc(100%-2rem)] sm:w-auto animate-[slide-up-fade_0.5s_ease-out]">
                 <TeacherNpc className="w-[150px] h-[200px] flex-shrink-0 hidden sm:block" />
                 <div className="relative bg-white text-slate-800 p-4 rounded-lg rounded-bl-none shadow-2xl">
                     <p className="text-base sm:text-lg">{currentStep.text}</p>
                     <div className="absolute left-0 -bottom-3 w-0 h-0 border-t-[15px] border-t-white border-l-[15px] border-l-transparent"/>
                     <div className="text-right mt-2 text-sm text-slate-500">Clique para continuar...</div>
                 </div>
            </div>

            <button 
                onClick={handleSkip} 
                className="absolute top-4 right-4 text-white bg-slate-800/80 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
                Pular Tutorial
            </button>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up-fade {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}