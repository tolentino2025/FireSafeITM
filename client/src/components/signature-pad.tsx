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

  // Helper function to check if canvas has content
  const checkCanvasContent = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Check if any non-white pixels exist
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1]; 
      const b = data[i + 2];
      
      // If any pixel is not white (255, 255, 255), there's content
      if (r < 255 || g < 255 || b < 255) {
        return true;
      }
    }
    return false;
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 150;

    // Set drawing properties
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Monitor canvas for programmatic changes (for testing)
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

    // Check for changes periodically (for programmatic updates)
    const interval = setInterval(checkForChanges, 500);
    
    // Also check on mouse/touch events that might be missed
    canvas.addEventListener('pointerup', checkForChanges);
    canvas.addEventListener('touchend', checkForChanges);
    
    return () => {
      clearInterval(interval);
      canvas.removeEventListener('pointerup', checkForChanges);
      canvas.removeEventListener('touchend', checkForChanges);
    };
  }, [hasSignature, checkCanvasContent, onSignatureChange]);

  // Handle name change
  const handleNameChange = useCallback((name: string) => {
    setSignerName(name);
    onNameChange?.(name);
  }, [onNameChange]);

  // Handle date change
  const handleDateChange = useCallback((date: string) => {
    setSignDate(date);
    onDateChange?.(date);
  }, [onDateChange]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((canvas: HTMLCanvasElement, e: MouseEvent | TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }, []);

  // Start drawing
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

  // Draw
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
    
    // Convert to data URL and notify parent
    const dataURL = canvas.toDataURL('image/png');
    onSignatureChange?.(dataURL);
  }, [isDrawing, getMousePos, onSignatureChange]);

  // Stop drawing
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

  // Clear signature
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
        {/* Name and Date Fields */}
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

        {/* Signature Canvas */}
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

        {/* Visual indicator */}
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