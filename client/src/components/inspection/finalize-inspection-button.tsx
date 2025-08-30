import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface FinalizeInspectionButtonProps {
  onFinalize: () => void;
  className?: string;
  disabled?: boolean;
}

export function FinalizeInspectionButton({ 
  onFinalize, 
  className = "", 
  disabled = false 
}: FinalizeInspectionButtonProps) {
  const handleFinalize = () => {
    // Navegar para a seção de assinaturas
    onFinalize();
    
    // Rolagem suave para o topo da página após um pequeno delay
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <Button
      onClick={handleFinalize}
      disabled={disabled}
      className={`bg-[#D2042D] hover:bg-[#B91C3C] text-white font-semibold ${className}`}
      data-testid="button-finalize-inspection"
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      Finalizar Inspeção
    </Button>
  );
}