
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SettingsPage = () => {
  const [feedback, setFeedback] = useState("");
  
  const handleSubmitFeedback = () => {
    if (feedback.trim().length < 5) {
      toast.error("Por favor, escreva uma sugestão com pelo menos 5 caracteres.");
      return;
    }
    
    // Here you would typically send the feedback to a backend
    console.log("Feedback submitted:", feedback);
    
    toast.success("Obrigado pelo seu feedback! Sua sugestão foi recebida.");
    setFeedback("");
  };
  
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Novos recursos em breve
          </CardTitle>
          <CardDescription>
            Estamos constantemente trabalhando para melhorar o CSV Sync Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nossa equipe está desenvolvendo novos recursos para tornar o gerenciamento de CSV ainda mais eficiente. 
            Fique atento às atualizações!
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Envie suas sugestões
          </CardTitle>
          <CardDescription>
            Suas ideias são importantes para nós
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tem alguma sugestão para melhorar nossa plataforma? Compartilhe conosco!
          </p>
          
          <Textarea 
            placeholder="Escreva sua sugestão aqui..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[120px]"
          />
          
          <Button onClick={handleSubmitFeedback}>
            Enviar sugestão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
