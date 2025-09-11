import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eraser, PenTool } from "lucide-react";

interface SignaturePadProps {
  title: string;
  onSignatureChange?: (signature: string | null) => void;
  onNameChange?: (name: string) => void;
  onDateChange?: (date: string) => void;
  defaultName?: string;
  defaultDate?: string;
  required?: boolean;
}

export function SignaturePad({ 
  title, 
  onSignatureChange, 
  onNameChange, 
  onDateChange,
  defaultName = "",
  defaultDate = "",
  required = false
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(defaultName);
  const [signDate, setSignDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);

  // Função auxiliar para verificar se o canvas tem conteúdo
  const checkCanvasContent = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Verificar se existem pixels que não são brancos
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1]; 
      const b = data[i + 2];
      
      // Se algum pixel não for branco (255, 255, 255), há conteúdo
      if (r < 255 || g < 255 || b < 255) {
        return true;
      }
    }
    return false;
  }, []);

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Definir tamanho do canvas
    canvas.width = 400;
    canvas.height = 150;

    // Definir propriedades de desenho
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Limpar canvas com fundo branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Monitorar canvas para mudanças programáticas (para testes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const checkForChanges = () => {
      const hasContent = checkCanvasContent(canvas);
      if (hasContent && !hasSignature) {
        setHasSignature(true);
        const dataURL = canvas.toDataURL('image/png');
        onSignatureChange?.(dataURL);
      }
    };

    // Verificar mudanças periodicamente (para atualizações programáticas)
    const interval = setInterval(checkForChanges, 500);
    
    // Também verificar em eventos de mouse/toque que possam ser perdidos
    canvas.addEventListener('pointerup', checkForChanges);
    canvas.addEventListener('touchend', checkForChanges);
    
    return () => {
      clearInterval(interval);
      canvas.removeEventListener('pointerup', checkForChanges);
      canvas.removeEventListener('touchend', checkForChanges);
    };
  }, [hasSignature, checkCanvasContent, onSignatureChange]);

  // Tratar mudança de nome
  const handleNameChange = useCallback((name: string) => {
    setSignerName(name);
    onNameChange?.(name);
  }, [onNameChange]);

  // Tratar mudança de data
  const handleDateChange = useCallback((date: string) => {
    setSignDate(date);
    onDateChange?.(date);
  }, [onDateChange]);

  // Obter posição do mouse relativa ao canvas
  const getMousePos = useCallback((canvas: HTMLCanvasElement, e: MouseEvent | TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }, []);

  // Iniciar desenho
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getMousePos(canvas, e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getMousePos]);

  // Desenhar
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(canvas, e.nativeEvent);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    setHasSignature(true);
    
    // Converter para data URL e notificar o pai
    const dataURL = canvas.toDataURL('image/png');
    onSignatureChange?.(dataURL);
  }, [isDrawing, getMousePos, onSignatureChange]);

  // Parar desenho
  const stopDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && isDrawing) {
      const hasContent = checkCanvasContent(canvas);
      if (hasContent) {
        setHasSignature(true);
        const dataURL = canvas.toDataURL('image/png');
        onSignatureChange?.(dataURL);
      }
    }
    setIsDrawing(false);
  }, [isDrawing, checkCanvasContent, onSignatureChange]);

  // Limpar assinatura
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    onSignatureChange?.(null);
  }, [onSignatureChange]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          <PenTool className="w-5 h-5 text-primary" />
          {title}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Campos de Nome e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${title}`} className="text-sm font-medium">
              Nome Completo {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`name-${title}`}
              value={signerName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Digite o nome completo"
              className="w-full"
              data-testid={`input-signature-name-${title.toLowerCase().replace(/\s/g, '-')}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`date-${title}`} className="text-sm font-medium">
              Data
            </Label>
            <Input
              id={`date-${title}`}
              type="date"
              value={signDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full"
              data-testid={`input-signature-date-${title.toLowerCase().replace(/\s/g, '-')}`}
            />
          </div>
        </div>

        {/* Canvas de Assinatura */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Assinatura Digital {required && <span className="text-red-500">*</span>}
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded bg-white cursor-crosshair w-full max-w-[400px] h-[150px]"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              data-testid={`canvas-signature-${title.toLowerCase().replace(/\s/g, '-')}`}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Desenhe sua assinatura usando o mouse ou toque na tela
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex items-center gap-2"
            data-testid={`button-clear-signature-${title.toLowerCase().replace(/\s/g, '-')}`}
          >
            <Eraser className="w-4 h-4" />
            Limpar Assinatura
          </Button>
        </div>

        {/* Indicador visual */}
        {hasSignature && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Assinatura capturada
          </div>
        )}
      </CardContent>
    </Card>
  );
}